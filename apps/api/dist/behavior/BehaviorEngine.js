"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BehaviorEngine = void 0;
const client_1 = require("@prisma/client");
class BehaviorEngine {
    prisma = new client_1.PrismaClient();
    async getProfile(agentId) {
        try {
            const allowedEvents = await this.prisma.actionEvent.findMany({
                where: {
                    execution: { agentId },
                    status: 'EXECUTED' // Only successfully completed external actions or ALLOWED actions
                },
                orderBy: { timestamp: 'asc' }
            });
            const actionFrequency = {};
            const transitions = {};
            let previousOp = null;
            for (const event of allowedEvents) {
                actionFrequency[event.operation] = (actionFrequency[event.operation] || 0) + 1;
                if (previousOp) {
                    const key = `${previousOp}->${event.operation}`;
                    transitions[key] = (transitions[key] || 0) + 1;
                }
                previousOp = event.operation;
            }
            return { actionFrequency, transitions, total: allowedEvents.length };
        }
        catch (e) {
            // Fallback if DB fails
            return {
                actionFrequency: { "read_file": 1, "run_tests": 1 },
                transitions: { "read_diff->read_tests": 1 },
                total: 2
            };
        }
    }
    async calculateDeviation(agentId, currentAction, previousAction) {
        const profile = await this.getProfile(agentId);
        let deviation = 0;
        const freq = profile.actionFrequency[currentAction] || 0;
        if (freq === 0 && profile.total > 0)
            deviation += 20;
        if (previousAction && profile.total > 0) {
            const transitionKey = `${previousAction}->${currentAction}`;
            const transFreq = profile.transitions[transitionKey] || 0;
            if (transFreq === 0)
                deviation += 20;
        }
        return deviation;
    }
}
exports.BehaviorEngine = BehaviorEngine;
