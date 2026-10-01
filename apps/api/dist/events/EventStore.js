"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStore = void 0;
const crypto_1 = require("crypto");
class EventStore {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async appendEvent(executionId, type, payload, actionEventData) {
        return await this.prisma.$transaction(async (tx) => {
            // 1. Get last event under exclusive lock
            const lastEvent = await tx.event.findFirst({
                where: { executionId },
                orderBy: { timestamp: 'desc' },
                select: { currentEventHash: true }
            });
            const previousHash = lastEvent?.currentEventHash || null;
            const payloadStr = JSON.stringify(payload);
            const contentToHash = previousHash ? `${previousHash}:${payloadStr}` : payloadStr;
            const currentHash = (0, crypto_1.createHash)("sha256").update(contentToHash).digest("hex");
            // 2. Insert ActionEvent if present
            if (actionEventData) {
                await tx.actionEvent.create({ data: actionEventData });
            }
            // 3. Insert Audit Event
            return await tx.event.create({
                data: {
                    executionId,
                    type,
                    payload,
                    previousEventHash: previousHash,
                    currentEventHash: currentHash
                }
            });
        });
    }
    async recordActionRequested(action) {
        await this.appendEvent(action.executionId, "ACTION_REQUESTED", action);
    }
    async recordActionAllowed(action, decision) {
        const actionEventData = this.buildActionEventData(action, decision, "ALLOWED");
        await this.appendEvent(action.executionId, "ACTION_ALLOWED", { action, decision }, actionEventData);
    }
    async recordActionBlocked(action, decision) {
        console.log(`[EventStore] Action BLOCKED recorded for ${action.operation}`);
        const actionEventData = this.buildActionEventData(action, decision, "BLOCKED");
        await this.appendEvent(action.executionId, "ACTION_BLOCKED", { action, decision }, actionEventData);
    }
    async recordActionFlagged(action, decision) {
        console.log(`[EventStore] Action FLAGGED (ASK) recorded for ${action.operation}`);
        const actionEventData = this.buildActionEventData(action, decision, "FLAGGED");
        await this.appendEvent(action.executionId, "ACTION_FLAGGED", { action, decision }, actionEventData);
    }
    async recordActionExecuted(action, result) {
        await this.appendEvent(action.executionId, "ACTION_EXECUTED", { action, result });
    }
    buildActionEventData(action, decision, status) {
        return {
            executionId: action.executionId,
            system: action.system,
            operation: action.operation,
            capability: action.capability,
            resource: action.resource,
            resourceType: action.resourceType,
            sensitivity: action.sensitivity || "PUBLIC",
            impact: action.impact || "LOW",
            status: status,
            payloadMetadata: action.argumentsMetadata,
            // Phase 4 additions
            provenanceLabels: action.provenance?.labels || [],
            provenanceSource: action.provenance?.source,
            destinationType: action.destination?.type,
            destinationIdentifier: action.destination?.identifier,
            decision: {
                create: {
                    decision: decision.decision,
                    riskScore: decision.riskScore,
                    deviationScore: decision.deviationScore,
                    reasons: decision.reasons,
                    matchedPolicies: decision.matchedPolicies || [],
                    constraints: decision.constraints || {},
                    approvalRequirements: decision.approvalRequirements || {},
                    evidenceMetadata: decision.evidenceMetadata || {}
                }
            }
        };
    }
}
exports.EventStore = EventStore;
