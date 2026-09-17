import { Action, Decision } from "@heed/runtime";
import { Evaluator, EvaluationContext } from "./evaluators/Evaluator";

export class DecisionEngine {
  private evaluators: Evaluator[] = [];
  
  // Thresholds (configurable)
  private readonly BLOCK_THRESHOLD = 80;
  private readonly ASK_THRESHOLD = 50;

  register(evaluator: Evaluator) {
    this.evaluators.push(evaluator);
  }

  async evaluate(context: EvaluationContext): Promise<Decision> {
    let totalScore = 0;
    const reasons: string[] = [];

    for (const evaluator of this.evaluators) {
      const result = await evaluator.evaluate(context);
      if (result.score !== 0) {
        totalScore += result.score;
        reasons.push(...result.reasons);
      }
    }

    // Normalize score 0-100
    const normalizedScore = Math.max(0, Math.min(100, totalScore));
    let decisionStatus: "ALLOW" | "ASK" | "BLOCK" = "ALLOW";

    if (normalizedScore >= this.BLOCK_THRESHOLD) {
      decisionStatus = "BLOCK";
    } else if (normalizedScore >= this.ASK_THRESHOLD) {
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
