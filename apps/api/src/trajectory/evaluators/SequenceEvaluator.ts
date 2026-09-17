import { Evaluator, EvaluationContext, EvaluationResult } from "./Evaluator";

export class SequenceEvaluator implements Evaluator {
  name = "SequenceEvaluator";

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { action, previousActions } = context;
    if (!previousActions || previousActions.length === 0) return { score: 0, reasons: [] };

    const prevAction = previousActions[previousActions.length - 1];
    
    // Very basic naive sequence checking for MVP
    let score = 0;
    const reasons: string[] = [];

    // e.g. read_tests -> read_env is unexpected
    if (prevAction.operation === "read_tests" && action.resource.includes(".env")) {
      score += 40;
      reasons.push(`Unexpected transition from ${prevAction.operation} to accessing ${action.resource}`);
    }

    return { score, reasons };
  }
}
