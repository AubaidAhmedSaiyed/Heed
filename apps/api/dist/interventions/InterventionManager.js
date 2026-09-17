"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterventionManager = void 0;
const events_1 = require("events");
class InterventionManager extends events_1.EventEmitter {
    interventions = new Map();
    async createIntervention(executionId, action, decision) {
        const id = `inv-${Math.random().toString(36).substring(2, 9)}`;
        const intervention = {
            id,
            executionId,
            action,
            decision,
            status: "PENDING"
        };
        this.interventions.set(id, intervention);
        return intervention;
    }
    async resolveIntervention(id, humanDecision) {
        const intervention = this.interventions.get(id);
        if (!intervention)
            throw new Error("Intervention not found");
        intervention.status = "RESOLVED";
        intervention.humanDecision = humanDecision;
        this.emit(`resolved:${id}`, humanDecision);
        return intervention;
    }
    getPendingInterventions() {
        return Array.from(this.interventions.values()).filter(i => i.status === "PENDING");
    }
}
exports.InterventionManager = InterventionManager;
