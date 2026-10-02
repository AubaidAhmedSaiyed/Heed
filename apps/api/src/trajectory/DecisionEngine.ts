import { Action, Decision } from "@heed-ai/runtime";
import { Evaluator, EvaluationContext } from "./evaluators/Evaluator";

export class DecisionEngine {
  private evaluators: Evaluator[] = [];
  

  register(evaluator: Evaluator) {
    this.evaluators.push(evaluator);
    // Sort evaluators by priority ascending
    this.evaluators.sort((a, b) => a.priority - b.priority);
  }

  async evaluate(context: EvaluationContext): Promise<Decision> {
    let totalScore = 0;
    const reasons: string[] = [];
    const matchedPolicies: string[] = [];
    
    // Severity mapping to determine final decision
    const decisionSeverity = {
      "ALLOW": 0,
      "ALLOW_CONSTRAINED": 1,
      "ASK": 2,
      "BOUND_APPROVAL": 3,
      "BLOCK": 4
    };
    
    let highestDecision: "ALLOW" | "ASK" | "BLOCK" | "ALLOW_CONSTRAINED" | "BOUND_APPROVAL" = "ALLOW";

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
    } catch (e: any) {
      console.error(`[DecisionEngine] Evaluator failed: ${e.message}. Failing closed.`);
      highestDecision = "BLOCK";
      reasons.push(`[SYSTEM_FAILURE] Internal security evaluation failed: ${e.message}`);
      totalScore = 100;
    }

    // Normalize score 0-100
    const normalizedScore = Math.max(0, Math.min(100, totalScore));
    

    return {
      decision: highestDecision,
      riskScore: normalizedScore,
      deviationScore: normalizedScore,
      reasons: reasons.length > 0 ? reasons : ["Action is within expected baseline."],
      matchedPolicies: Array.from(new Set(matchedPolicies)), // deduplicate
    };
  }
}
