"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeGateway = void 0;
class RuntimeGateway {
    // Placeholder dependencies for now
    normalizer;
    trajectoryEngine;
    connectorManager;
    eventStore;
    interventionManager;
    prisma;
    constructor(deps) {
        this.normalizer = deps.normalizer;
        this.trajectoryEngine = deps.trajectoryEngine;
        this.connectorManager = deps.connectorManager;
        this.eventStore = deps.eventStore;
        this.interventionManager = deps.interventionManager;
        this.prisma = deps.prisma;
    }
    async processActionRequest(workspaceId, executionId, rawRequest) {
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
        }
        catch (e) {
            if (e.message.includes("Invalid transition"))
                throw e;
        }
        // 1. Normalize and redact action metadata
        const actionMetadata = await this.normalizer.normalize(executionId, rawRequest);
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
        let previousActions = [];
        let objective = "Fallback objective";
        try {
            if (!prisma)
                throw new Error("Database client not injected.");
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
            previousActions = events.map((e) => ({
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
            actionMetadata.activePolicyVersions = snapshots.map((s) => s.policyVersion);
        }
        catch (e) {
            console.error(`[RuntimeGateway] Evaluation Context failure: ${e.message}`);
            const err = new Error(`Security Evaluation Failure: ${e.message}`);
            err.decision = "FAIL_CLOSED";
            err.reasons = ["Failed to retrieve execution context (contract or trajectory or policies)."];
            throw err;
        }
        const decision = await this.trajectoryEngine.evaluate({
            action: actionMetadata,
            contract: contract || undefined,
            objective,
            previousActions
        });
        console.log(`[RuntimeGateway] Decision for ${actionMetadata.system}.${actionMetadata.operation}: ${decision.decision} (Mode: ${evaluationMode})`);
        // 3. Handle decision
        if (decision.decision === "BLOCK") {
            await this.eventStore.recordActionBlocked(workspaceId, actionMetadata, decision);
            if (evaluationMode === "ENFORCE") {
                const err = new Error(`Action blocked: ${decision.reasons.join(", ")}`);
                err.decision = "BLOCK";
                err.reasons = decision.reasons;
                throw err;
            }
            else {
                console.log(`[RuntimeGateway] Observe Mode bypass: Action would have been blocked.`);
            }
        }
        else if (decision.decision === "ASK" || decision.decision === "BOUND_APPROVAL") {
            const actionEventId = await this.eventStore.recordActionFlagged(workspaceId, actionMetadata, decision);
            if (evaluationMode === "ENFORCE") {
                console.log(`[RuntimeGateway] Execution ${executionId} paused. Creating intervention for human approval...`);
                if (prisma) {
                    await prisma.execution.update({ where: { id: executionId }, data: { status: "AWAITING_APPROVAL" } }).catch(() => { });
                }
                const interventionManager = this.interventionManager;
                const intervention = await interventionManager.createIntervention(workspaceId, executionId, actionMetadata, decision, actionEventId);
                console.log(`[RuntimeGateway] Intervention created: ${intervention.id}. Waiting for resolution...`);
                const humanDecision = await new Promise((resolve) => {
                    interventionManager.once(`resolved:${intervention.id}`, (dec) => {
                        resolve(dec);
                    });
                });
                console.log(`[RuntimeGateway] Intervention ${intervention.id} resolved with: ${humanDecision}`);
                if (humanDecision === "TERMINATE_EXECUTION") {
                    if (prisma)
                        await prisma.execution.update({ where: { id: executionId }, data: { status: "TERMINATED" } }).catch(() => { });
                    const err = new Error(`Execution terminated by human intervention.`);
                    err.decision = "TERMINATED";
                    err.reasons = ["Human review: TERMINATE"];
                    throw err;
                }
                if (humanDecision === "BLOCK") {
                    await this.eventStore.recordActionBlocked(workspaceId, actionMetadata, decision);
                    if (prisma)
                        await prisma.execution.update({ where: { id: executionId }, data: { status: "RUNNING" } }).catch(() => { });
                    const err = new Error(`Action blocked by human intervention.`);
                    err.decision = "BLOCK";
                    err.reasons = ["Human review: BLOCK"];
                    throw err;
                }
                // If ALLOW_ONCE, we fall through to ALLOW execution
                if (prisma)
                    await prisma.execution.update({ where: { id: executionId }, data: { status: "RUNNING" } }).catch(() => { });
            }
            else {
                console.log(`[RuntimeGateway] Observe Mode bypass: Action would have asked for human approval.`);
            }
        }
        // ALLOW (or ALLOW_ONCE or OBSERVE bypass)
        await this.eventStore.recordActionAllowed(workspaceId, actionMetadata, decision);
        // 4. Execute through the proper connector
        const result = await this.connectorManager.execute(rawRequest);
        // 5. Record outcome
        await this.eventStore.recordActionExecuted(workspaceId, actionMetadata, result);
        return result;
    }
}
exports.RuntimeGateway = RuntimeGateway;
