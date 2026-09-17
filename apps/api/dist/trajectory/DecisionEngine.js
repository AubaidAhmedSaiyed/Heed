"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionEngine = void 0;
class DecisionEngine {
    evaluators = [];
    // Thresholds (configurable)
    BLOCK_THRESHOLD = 80;
    ASK_THRESHOLD = 50;
    register(evaluator) {
        this.evaluators.push(evaluator);
    }
    async evaluate(context) {
        let totalScore = 0;
        const reasons = [];
        for (const evaluator of this.evaluators) {
            const result = await evaluator.evaluate(context);
            if (result.score !== 0) {
                totalScore += result.score;
                reasons.push(...result.reasons);
            }
        }
        // Normalize score 0-100
        const normalizedScore = Math.max(0, Math.min(100, totalScore));
        let decisionStatus = "ALLOW";
        if (normalizedScore >= this.BLOCK_THRESHOLD) {
            decisionStatus = "BLOCK";
        }
        else if (normalizedScore >= this.ASK_THRESHOLD) {
            decisionStatus = "ASK";
        }
        return {
            decision: decisionStatus,
            riskScore: normalizedScore, // Simplified mapping for now
            deviationScore: normalizedScore,
            reasons: reasons.length > 0 ? reasons : ["Action is within expected baseline."]
        };
    }
}
exports.DecisionEngine = DecisionEngine;
