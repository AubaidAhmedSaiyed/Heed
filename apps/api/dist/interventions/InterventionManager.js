"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterventionManager = void 0;
const events_1 = require("events");
class InterventionManager extends events_1.EventEmitter {
    interventions = new Map();
    prisma;
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async createIntervention(workspaceId, executionId, action, decision, actionEventId) {
        const id = `inv-${Math.random().toString(36).substring(2, 9)}`;
        const intervention = {
            id,
            executionId,
            action,
            decision,
            status: "PENDING"
        };
        this.interventions.set(id, intervention);
        await this.prisma.intervention.create({
            data: {
                id,
                executionId,
                actionEventId,
                status: "PENDING",
                reason: decision.reasons[0] || "Requires approval"
            }
        });
        return intervention;
    }
    async resolveIntervention(id, humanDecision) {
        const res = await this.prisma.intervention.updateMany({
            where: { id, status: "PENDING" },
            data: {
                status: "RESOLVED",
                humanDecision,
                resolvedAt: new Date()
            }
        });
        if (res.count === 0) {
            throw new Error("Intervention already resolved or not found");
        }
        const intervention = this.interventions.get(id);
        if (intervention) {
            intervention.status = "RESOLVED";
            intervention.humanDecision = humanDecision;
        }
        this.emit(`resolved:${id}`, humanDecision);
        return intervention;
    }
    getPendingInterventions() {
        return Array.from(this.interventions.values()).filter(i => i.status === "PENDING");
    }
}
exports.InterventionManager = InterventionManager;
