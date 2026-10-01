"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionEngine = void 0;
class DecisionEngine {
    evaluators = [];
    // Legacy thresholds
    BLOCK_THRESHOLD = 80;
    ASK_THRESHOLD = 50;
    register(evaluator) {
        this.evaluators.push(evaluator);
        // Sort evaluators by priority ascending
        this.evaluators.sort((a, b) => a.priority - b.priority);
    }
    async evaluate(context) {
        let totalScore = 0;
        const reasons = [];
        const matchedPolicies = [];
        // Severity mapping to determine final decision
        const decisionSeverity = {
            "ALLOW": 0,
            "ALLOW_CONSTRAINED": 1,
            "ASK": 2,
            "BOUND_APPROVAL": 3,
            "BLOCK": 4
        };
        let highestDecision = "ALLOW";
        try {
            for (const evaluator of this.evaluators) {
                const result = await evaluator.evaluate(context);
                if (result.score !== 0) {
                    totalScore += result.score;
                }
                if (result.reasons.length > 0) {
                    reasons.push(...result.reasons);
                }
                if (result.matchedPolicies && result.matchedPolicies.length > 0) {
                    matchedPolicies.push(...result.matchedPolicies);
                }
                if (result.decision) {
                    if (decisionSeverity[result.decision] > decisionSeverity[highestDecision]) {
                        highestDecision = result.decision;
                    }
                }
            }
        }
        catch (e) {
            console.error(`[DecisionEngine] Evaluator failed: ${e.message}. Failing closed.`);
            highestDecision = "BLOCK";
            reasons.push(`[SYSTEM_FAILURE] Internal security evaluation failed: ${e.message}`);
            totalScore = 100;
        }
        // Normalize score 0-100
        const normalizedScore = Math.max(0, Math.min(100, totalScore));
        // If no definitive decision was returned by evaluators, fall back to threshold logic
        if (highestDecision === "ALLOW") {
            if (normalizedScore >= this.BLOCK_THRESHOLD) {
                highestDecision = "BLOCK";
            }
            else if (normalizedScore >= this.ASK_THRESHOLD) {
                highestDecision = "ASK";
            }
        }
        return {
            decision: highestDecision,
            riskScore: normalizedScore,
            deviationScore: normalizedScore,
            reasons: reasons.length > 0 ? reasons : ["Action is within expected baseline."],
            matchedPolicies: Array.from(new Set(matchedPolicies)), // deduplicate
        };
    }
}
exports.DecisionEngine = DecisionEngine;
