import { Evaluator, EvaluationContext, EvaluationResult } from "./Evaluator";

export class CapabilityEvaluator implements Evaluator {
  name = "CapabilityEvaluator";

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { action } = context;
    
    let score = 0;
    const reasons: string[] = [];

    // Capability escalation checks
    if (action.capability === "external_network.write" || action.capability === "deployment.execute") {
      score += 30;
      reasons.push(`Action requires highly privileged capability: ${action.capability}`);
    }

    return { score, reasons };
  }
}
