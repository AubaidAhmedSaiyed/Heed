"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStore = void 0;
class EventStore {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordActionRequested(action) {
        try {
            return await this.prisma.event.create({
                data: {
                    executionId: action.executionId,
                    type: "ACTION_REQUESTED",
                    payload: action
                }
            });
        }
        catch (e) {
            // ignore for MVP if no DB
        }
    }
    async recordActionAllowed(action, decision) {
        try {
            return await this.prisma.event.create({
                data: {
                    executionId: action.executionId,
                    type: "ACTION_ALLOWED",
                    payload: { action, decision }
                }
            });
        }
        catch (e) {
            // ignore for MVP if no DB
        }
    }
    async recordActionBlocked(action, decision) {
        console.log(`[EventStore] Action BLOCKED recorded for ${action.operation}`);
        try {
            await this.prisma.actionEvent.create({
                data: {
                    executionId: action.executionId,
                    system: action.system,
                    operation: action.operation,
                    capability: action.capability,
                    resource: action.resource,
                    resourceType: action.resourceType,
                    sensitivity: action.sensitivity || "PUBLIC",
                    status: "BLOCKED",
                    payloadMetadata: { objective: "Fallback objective", sequenceNumber: action.sequenceNumber },
                    decision: {
                        create: {
                            decision: decision.decision,
                            riskScore: decision.riskScore,
                            deviationScore: decision.deviationScore,
                            reasons: decision.reasons
                        }
                    }
                }
            });
        }
        catch (e) { /* ignore */ }
    }
    async recordActionFlagged(action, decision) {
        console.log(`[EventStore] Action FLAGGED (ASK) recorded for ${action.operation}`);
        try {
            await this.prisma.actionEvent.create({
                data: {
                    executionId: action.executionId,
                    system: action.system,
                    operation: action.operation,
                    capability: action.capability,
                    resource: action.resource,
                    resourceType: action.resourceType,
                    sensitivity: action.sensitivity || "PUBLIC",
                    status: "FLAGGED",
                    decision: {
                        create: {
                            decision: decision.decision,
                            riskScore: decision.riskScore,
                            deviationScore: decision.deviationScore,
                            reasons: decision.reasons
                        }
                    }
                }
            });
        }
        catch (e) { /* ignore */ }
    }
    async recordActionExecuted(action, result) {
        try {
            return await this.prisma.event.create({
                data: {
                    executionId: action.executionId,
                    type: "ACTION_EXECUTED",
                    payload: { action, result }
                }
            });
        }
        catch (e) {
            // ignore for MVP if no DB
        }
    }
}
exports.EventStore = EventStore;
