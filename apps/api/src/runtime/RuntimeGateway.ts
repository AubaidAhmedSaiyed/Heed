import { RawActionRequest, Action, Decision } from "@heed-ai/runtime";
import { ImpactEvaluator } from "./ImpactEvaluator";

export class RuntimeGateway {
  // Placeholder dependencies for now
  private normalizer: any;
  private trajectoryEngine: any;
  private connectorManager: any;
  private eventStore: any;
  private interventionManager: any;
  private prisma: any;

  constructor(deps: any) {
    this.normalizer = deps.normalizer;
    this.trajectoryEngine = deps.trajectoryEngine;
    this.connectorManager = deps.connectorManager;
    this.eventStore = deps.eventStore;
    this.interventionManager = deps.interventionManager;
    this.prisma = deps.prisma;
  }

  async processActionRequest(workspaceId: string, executionId: string, rawRequest: RawActionRequest): Promise<any> {
    console.log(`[RuntimeGateway] Processing action request for execution ${executionId}`);
    const prisma = this.prisma;
    
    // Idempotency check
    if (prisma && rawRequest.idempotencyKey) {
      const existing = await prisma.actionEvent.findFirst({
        where: { 
          idempotencyKey: rawRequest.idempotencyKey,
          execution: { agent: { workspaceId } }
        }
      });
      if (existing) {
        console.log(`[RuntimeGateway] Idempotency match for key ${rawRequest.idempotencyKey}. Returning existing result.`);
        // Note: For MVP, returning the metadata. In a real system, we'd store and return the actual execution result payload.
        return existing.payloadMetadata || { status: existing.status };
      }
    }

    let evaluationMode = "ENFORCE";
    try {
      if (prisma) {
        const execution = await prisma.execution.findFirst({ 
          where: { id: executionId, agent: { workspaceId } } 
        });
        if (execution) {
          evaluationMode = execution.evaluationMode || "ENFORCE";
          if (["COMPLETED", "TERMINATED", "FAILED", "BLOCKED", "AWAITING_APPROVAL"].includes(execution.status)) {
             throw new Error(`Invalid transition: Cannot execute action from state ${execution.status}`);
          }
          if (execution.status !== "RUNNING") {
            await prisma.execution.update({ where: { id: executionId }, data: { status: "RUNNING" } });
          }
        }
      }
    } catch(e: any) {
      if (e.message.includes("Invalid transition")) throw e;
    }
    
    // 1. Normalize and redact action metadata
    const actionMetadata: Action = await this.normalizer.normalize(executionId, rawRequest);
    if (prisma) {
      const execution = await prisma.execution.findFirst({ 
        where: { id: executionId, agent: { workspaceId } } 
      });
      if (execution) {
        actionMetadata.agentId = execution.agentId;
      }
    }
    
    // 2. Trajectory Engine determines ALLOW, ASK, or BLOCK
    let contract = null;
    let previousActions: Action[] = [];
    let objective = "Fallback objective";
    
    try {
      if (!prisma) throw new Error("Database client not injected.");
      
      const dbContract = await prisma.executionContract.findFirst({ 
        where: { executionId, execution: { agent: { workspaceId } } } 
      });
      if (!dbContract) {
        throw new Error(`Fail-closed: No execution contract found for execution ${executionId}. Cannot authorize action without a contract.`);
      }
      contract = dbContract;
      objective = dbContract.objective;
      
      const events = await prisma.actionEvent.findMany({ 
         where: { executionId, execution: { agent: { workspaceId } }, status: "ALLOWED" }, // only allowed actions make up trajectory
         orderBy: { timestamp: 'asc' }
      });
      
      previousActions = events.map((e: any) => ({
        system: e.system,
        operation: e.operation,
        resource: e.resource,
        capability: e.capability || undefined,
        sensitivity: e.sensitivity,
      }));

      // Phase 2: Load Active Policy Snapshots
      const snapshots = await prisma.executionPolicySnapshot.findMany({
        where: { executionId, execution: { agent: { workspaceId } } },
        include: { policyVersion: true }
      });
      
      // We map these snapshots into the context for the DecisionEngine
      (actionMetadata as any).activePolicyVersions = snapshots.map((s: any) => s.policyVersion);

    } catch(e: any) {
      console.error(`[RuntimeGateway] Evaluation Context failure: ${e.message}`);
      const err = new Error(`Security Evaluation Failure: ${e.message}`);
      (err as any).decision = "FAIL_CLOSED";
      (err as any).reasons = ["Failed to retrieve execution context (contract or trajectory or policies)."];
      throw err;
    }
    

    const decision: Decision = await this.trajectoryEngine.evaluate({
      action: actionMetadata,
      contract: contract || undefined,
      objective,
      previousActions
    });

    // IMPACT AWARE AUTONOMY
    let connector;
    let metadata;
    let currentBudget = 30;
    let consumedBudget = 0;
    let currentTrustState = "TRUSTED";
    let finalImpactWeight = 1;
    let newTrustState = "TRUSTED";

    try {
      connector = this.connectorManager.getConnector(actionMetadata.system);
      metadata = connector?.getOperationMetadata(actionMetadata.operation, actionMetadata.capability) || {
        reversibility: "UNKNOWN",
        impactWeight: 3,
        dataSensitivity: "INTERNAL",
        trustEffect: "NONE",
        compensationAvailable: false
      };
      
      if (prisma) {
        const ex = await prisma.execution.findUnique({ where: { id: executionId } });
        if (ex) {
          currentBudget = ex.impactBudget;
          consumedBudget = ex.impactConsumed;
          currentTrustState = ex.trustState;
        }
      }

      const evaluator = new ImpactEvaluator();
      const impactResult = evaluator.evaluate(actionMetadata, metadata as any, currentBudget, consumedBudget, currentTrustState, decision);

      decision.decision = impactResult.decision;
      decision.reasons.push(...impactResult.signals);
      
      finalImpactWeight = impactResult.impactWeight;
      newTrustState = impactResult.newTrustState;
      
    } catch (err: any) {
      console.error("[RuntimeGateway] Impact evaluation failed", err);
    }


    console.log(`[RuntimeGateway] Decision for ${actionMetadata.system}.${actionMetadata.operation}: ${decision.decision} (Mode: ${evaluationMode})`);

    // 3. Handle decision
    if (decision.decision === "BLOCK") {
      await this.eventStore.recordActionBlocked(workspaceId, actionMetadata, decision);
      if (evaluationMode === "ENFORCE") {
        const err = new Error(`Action blocked: ${decision.reasons.join(", ")}`);
        (err as any).decision = "BLOCK";
        (err as any).reasons = decision.reasons;
        throw err;
      } else {
        console.log(`[RuntimeGateway] Observe Mode bypass: Action would have been blocked.`);
      }
    } else if (decision.decision === "ASK" || decision.decision === "BOUND_APPROVAL") {
      const actionEventId = await this.eventStore.recordActionFlagged(workspaceId, actionMetadata, decision);
      
      if (evaluationMode === "ENFORCE") {
        console.log(`[RuntimeGateway] Execution ${executionId} paused. Creating intervention for human approval...`);
        if (prisma) {
          await prisma.execution.update({ where: { id: executionId }, data: { status: "AWAITING_APPROVAL" } }).catch(() => {});
        }
        const interventionManager = this.interventionManager;
        
        const intervention = await interventionManager.createIntervention(workspaceId, executionId, actionMetadata, decision, actionEventId as string);
        console.log(`[RuntimeGateway] Intervention created: ${intervention.id}. Waiting for resolution...`);
        
        const humanDecision = await new Promise((resolve) => {
          interventionManager.once(`resolved:${intervention.id}`, (dec: string) => {
            resolve(dec);
          });
        });

        console.log(`[RuntimeGateway] Intervention ${intervention.id} resolved with: ${humanDecision}`);
        
        if (humanDecision === "TERMINATE_EXECUTION") {
          if (prisma) await prisma.execution.update({ where: { id: executionId }, data: { status: "TERMINATED" } }).catch(() => {});
          const err = new Error(`Execution terminated by human intervention.`);
          (err as any).decision = "TERMINATED";
          (err as any).reasons = ["Human review: TERMINATE"];
          await this.runCompensation(workspaceId, executionId);
          throw err;
        }
        if (humanDecision === "BLOCK") {
          await this.eventStore.recordActionBlocked(workspaceId, actionMetadata, decision);
          if (prisma) await prisma.execution.update({ where: { id: executionId }, data: { status: "RUNNING" } }).catch(() => {});
          const err = new Error(`Action blocked by human intervention.`);
          (err as any).decision = "BLOCK";
          (err as any).reasons = ["Human review: BLOCK"];
          await this.runCompensation(workspaceId, executionId);
          throw err;
        }
        
        // If ALLOW_ONCE, we fall through to ALLOW execution
        if (prisma) await prisma.execution.update({ where: { id: executionId }, data: { status: "RUNNING" } }).catch(() => {});
      } else {
        console.log(`[RuntimeGateway] Observe Mode bypass: Action would have asked for human approval.`);
      }
    }

    // ALLOW (or ALLOW_ONCE or OBSERVE bypass)
    await this.eventStore.recordActionAllowed(workspaceId, actionMetadata, decision);
    
    // 4. Execute through the proper connector
    const result = await this.connectorManager.execute(rawRequest);

    // Atomic Budget Accounting
    if (prisma && evaluationMode === "ENFORCE") {
      try {
        await prisma.$transaction(async (tx: any) => {
          const ex = await tx.execution.findUnique({ where: { id: executionId }});
          if (ex) {
            if (ex.impactBudget - ex.impactConsumed < finalImpactWeight) {
               console.warn("Concurrency Warning: Budget exceeded during atomic transaction");
            }
            await tx.execution.update({
              where: { id: executionId },
              data: {
                impactConsumed: { increment: finalImpactWeight },
                trustState: newTrustState
              }
            });
          }
        });
      } catch (err: any) {
        console.error("Atomic accounting failed", err);
      }
    }

    // 5. Record outcome
    await this.eventStore.recordActionExecuted(workspaceId, actionMetadata, result);
    
    // Record action event metadata for compensation and tracking
    if (prisma && metadata) {
      const event = await prisma.actionEvent.findFirst({
        where: { executionId, system: actionMetadata.system, operation: actionMetadata.operation },
        orderBy: { timestamp: "desc" }
      });
      if (event) {
        await prisma.actionEvent.update({
          where: { id: event.id },
          data: {
            impactWeight: metadata.impactWeight,
            reversibility: metadata.reversibility,
            trustStateAfter: newTrustState
          }
        });
      }
    }

    return result;
  }

  async runCompensation(workspaceId: string, executionId: string) {
    if (!this.prisma) return;
    console.log(`[RuntimeGateway] Initiating compensation for execution ${executionId}`);
    const events = await this.prisma.actionEvent.findMany({
      where: { executionId, status: "EXECUTED" },
      orderBy: { timestamp: 'desc' }
    });

    for (const event of events) {
      if (event.reversibility === "REVERSIBLE") {
        try {
          const connector = this.connectorManager.getConnector(event.system);
          if (connector && typeof connector.compensate === "function") {
            const comp = await this.prisma.compensation.create({
              data: {
                executionId,
                actionEventId: event.id,
                status: "RUNNING"
              }
            });
            try {
              // Note: For MVP, reconstruct basic rawRequest from event
              const fakeRawReq = {
                 system: event.system,
                 operation: event.operation,
                 resource: event.resource,
                 arguments: (event.payloadMetadata as any)?.arguments || {}
              };
              const result = await connector.compensate(fakeRawReq);
              await this.prisma.compensation.update({
                where: { id: comp.id },
                data: { status: "SUCCEEDED", completedAt: new Date(), resultMetadata: result || {} }
              });
              console.log(`[Compensation] Reverted ${event.system}.${event.operation} successfully.`);
            } catch (err: any) {
              await this.prisma.compensation.update({
                where: { id: comp.id },
                data: { status: "FAILED", completedAt: new Date(), error: err.message }
              });
              console.error(`[Compensation] Failed reverting ${event.system}.${event.operation}: ${err.message}`);
            }
          } else {
             // Record skip
             await this.prisma.compensation.create({
                data: {
                  executionId,
                  actionEventId: event.id,
                  status: "SKIPPED",
                  error: "No compensate function available"
                }
              });
          }
        } catch (e) {
          console.error("Compensation orchestration error", e);
        }
      }
    }
  }
}

