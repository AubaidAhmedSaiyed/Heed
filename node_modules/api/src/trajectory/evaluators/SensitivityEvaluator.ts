import { Evaluator, EvaluationContext, EvaluationResult } from "./Evaluator";

export class SensitivityEvaluator implements Evaluator {
  name = "SensitivityEvaluator";

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { action } = context;
    let score = 0;
    const reasons: string[] = [];

    if (action.sensitivity === "RESTRICTED") {
      score += 30;
      reasons.push("Action targets a RESTRICTED resource.");
    } else if (action.sensitivity === "CONFIDENTIAL") {
      score += 15;
      reasons.push("Action targets a CONFIDENTIAL resource.");
    }

    return { score, reasons };
  }
}
