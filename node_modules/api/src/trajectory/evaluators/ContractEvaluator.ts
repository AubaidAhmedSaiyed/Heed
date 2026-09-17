import { Evaluator, EvaluationContext, EvaluationResult } from "./Evaluator";

export class ContractEvaluator implements Evaluator {
  name = "ContractEvaluator";

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { action, contract } = context;
    if (!contract) return { score: 0, reasons: [] };

    let score = 0;
    const reasons: string[] = [];

    if (!contract.allowedSystems.includes(action.system)) {
      score += 40;
      reasons.push(`System '${action.system}' is not in allowed systems.`);
    }

    if (!contract.allowedCapabilities.includes(action.capability || '')) {
      score += 30;
      reasons.push(`Capability '${action.capability}' is not in allowed capabilities.`);
    }

    // Checking against restricted resources (naive string check for MVP)
    const isRestricted = contract.restrictedResources.some(res => action.resource.includes(res));
    if (isRestricted) {
      score += 50;
      reasons.push(`Resource '${action.resource}' matches restricted resources.`);
    }

    if (score === 0) {
      // Reward staying strictly in expected actions
      if (contract.expectedActions.includes(action.operation)) {
        score -= 20; 
      }
    }

    return { score, reasons };
  }
}
