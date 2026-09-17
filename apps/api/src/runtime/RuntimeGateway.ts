import { RawActionRequest, Action, Decision } from "@heed/runtime";

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

  async processActionRequest(executionId: string, rawRequest: RawActionRequest): Promise<any> {
    console.log(`[RuntimeGateway] Processing action request for execution ${executionId}`);
    const prisma = this.prisma;
    try {
      if (prisma) {
        const execution = await prisma.execution.findUnique({ where: { id: executionId } });
        if (execution) {
          if (["COMPLETED", "TERMINATED", "FAILED", "BLOCKED"].includes(execution.status)) {
             throw new Error(`Invalid transition: Cannot execute action from state ${execution.status}`);
          }
          await prisma.execution.update({ where: { id: executionId }, data: { status: "RUNNING" } });
        }
      }
    } catch(e: any) {
      if (e.message.includes("Invalid transition")) throw e;
    }
    
    // 1. Normalize and redact action metadata
    const actionMetadata: Action = await this.normalizer.normalize(executionId, rawRequest);
    
    // 2. Trajectory Engine determines ALLOW, ASK, or BLOCK
    let contract = null;
    let previousActions: Action[] = [];
    let objective = "Fallback objective";
    
    try {
      if (prisma) {
        const dbContract = await prisma.executionContract.findUnique({ where: { executionId } });
        if (dbContract) {
           contract = dbContract;
           objective = dbContract.objective;
        }
        
        const events = await prisma.actionEvent.findMany({ 
           where: { executionId, status: "ALLOWED" }, // only allowed actions make up trajectory
           orderBy: { timestamp: 'asc' }
        });
        
        previousActions = events.map((e: any) => ({
          system: e.system,
          operation: e.operation,
          resource: e.resource,
          capability: e.capability || undefined,
          sensitivity: e.sensitivity,
        }));
      }
    } catch(e) {
      console.warn("Could not fetch execution context from DB. Using in-memory fallback.");
    }
    
    if (!contract) {
      contract = {
        executionId,
        objective: "Fallback objective",
        expectedActions: ["read_pull_request", "read_diff", "post_review", "post", "send_message"],
        allowedSystems: ["github", "http", "slack"],
        allowedCapabilities: ["repository.read", "communication.write", "file.read", "external_network.write"],
        restrictedResources: ["secrets", "environment", "production", ".env"]
      };
    }
    
    const decision: Decision = await this.trajectoryEngine.evaluate({
      action: actionMetadata,
      contract: contract || undefined,
      objective,
      previousActions
    });

    console.log(`[RuntimeGateway] Decision for ${actionMetadata.system}.${actionMetadata.operation}: ${decision.decision}`);

    // 3. Handle decision
    if (decision.decision === "BLOCK") {
      await this.eventStore.recordActionBlocked(actionMetadata, decision);
      const err = new Error(`Action blocked: ${decision.reasons.join(", ")}`);
      (err as any).decision = "BLOCK";
      (err as any).reasons = decision.reasons;
      throw err;
    }

    if (decision.decision === "ASK") {
      await this.eventStore.recordActionFlagged(actionMetadata, decision);
      
      console.log(`[RuntimeGateway] Execution ${executionId} paused. Creating intervention for human approval...`);
      if (prisma) {
        await prisma.execution.update({ where: { id: executionId }, data: { status: "AWAITING_APPROVAL" } }).catch(() => {});
      }
      const interventionManager = this.interventionManager;
      
      const intervention = await interventionManager.createIntervention(executionId, actionMetadata, decision);
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
        throw err;
      }
      if (humanDecision === "BLOCK") {
        await this.eventStore.recordActionBlocked(actionMetadata, decision);
        if (prisma) await prisma.execution.update({ where: { id: executionId }, data: { status: "RUNNING" } }).catch(() => {});
        const err = new Error(`Action blocked by human intervention.`);
        (err as any).decision = "BLOCK";
        (err as any).reasons = ["Human review: BLOCK"];
        throw err;
      }
      
      // If ALLOW_ONCE, we fall through to ALLOW execution
      if (prisma) await prisma.execution.update({ where: { id: executionId }, data: { status: "RUNNING" } }).catch(() => {});
    }

    // ALLOW (or ALLOW_ONCE)
    await this.eventStore.recordActionAllowed(actionMetadata, decision);
    
    // 4. Execute through the proper connector
    const result = await this.connectorManager.execute(rawRequest);

    // 5. Record outcome
    await this.eventStore.recordActionExecuted(actionMetadata, result);

    return result;
  }
}
