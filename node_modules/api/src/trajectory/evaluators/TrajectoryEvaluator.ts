import { Evaluator, EvaluationContext, EvaluationResult } from "./Evaluator";

export class TrajectoryEvaluator implements Evaluator {
  name = "TrajectoryEvaluator";

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { action, previousActions, objective, contract } = context;
    if (!previousActions || previousActions.length === 0) return { score: 0, reasons: [] };

    let score = 0;
    const reasons: string[] = [];

    // 1. REPETITION / LOOP DETECTION
    const recentActions = previousActions.slice(-2);
    if (recentActions.length === 2 && 
        recentActions[0].operation === action.operation && recentActions[0].resource === action.resource &&
        recentActions[1].operation === action.operation && recentActions[1].resource === action.resource) {
      score += 40;
      reasons.push(`Action repetition detected: '${action.operation}' on '${action.resource}' called 3 times sequentially.`);
    }

    // 2. CAPABILITY ESCALATION
    const pastCapabilities = new Set(previousActions.map(a => a.capability));
    if (!pastCapabilities.has(action.capability) && (action.capability === "external_network.write" || action.capability === "credential.read")) {
      // Is this escalation explicitly bounded by the objective keywords?
      const normalizedObjective = objective?.toLowerCase() || "";
      const isJustified = 
        (action.capability === "credential.read" && normalizedObjective.includes("credential")) ||
        (action.capability === "external_network.write" && (normalizedObjective.includes("deploy") || normalizedObjective.includes("post") || normalizedObjective.includes("send") || normalizedObjective.includes("webhook")));
        
      if (!isJustified) {
        score += 30;
        reasons.push(`[CAPABILITY_ESCALATION] Suddenly requesting highly sensitive capability '${action.capability}' without precedent or objective justification.`);
      }
    }

    // 3. OBJECTIVE DEVIATION
    const isResourceRestrictedInGeneral = action.resource.includes(".env") || action.resource.includes("credentials") || action.resource.includes("secret");
    if (isResourceRestrictedInGeneral) {
      if (objective && !objective.toLowerCase().includes("secret") && !objective.toLowerCase().includes("credential")) {
        score += 50;
        reasons.push(`[OBJECTIVE_DEVIATION] Accessing highly sensitive resource '${action.resource}' is not aligned with the stated objective.`);
      }
    }

    // 4. CONTEXTUAL SENSE (e.g. attempting to write/post before gathering any data)
    if (action.capability?.includes(".write")) {
      if (previousActions.length === 0 || previousActions.every(a => a.capability?.includes(".write"))) {
        score += 40;
        reasons.push(`[TRAJECTORY_DEVIATION] Attempting a write capability ('${action.capability}') without preceding reads or context gathering.`);
      }
    }

    return { score, reasons };
  }
}
