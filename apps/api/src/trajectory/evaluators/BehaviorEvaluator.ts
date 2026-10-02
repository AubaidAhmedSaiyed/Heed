import { Evaluator, EvaluationContext, EvaluationResult } from "./Evaluator";
import { BehaviorEngine } from "../../behavior/BehaviorEngine";

export class BehaviorEvaluator implements Evaluator {
  name = "BehaviorEvaluator";
  priority = 50;
  private behaviorEngine = new BehaviorEngine();

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { action, previousActions, contract } = context;
    const previousAction = previousActions?.length ? previousActions[previousActions.length - 1].operation : undefined;
    
    const agentId = action.agentId || "unknown-agent";
    const deviation = await this.behaviorEngine.calculateDeviation(agentId, action.operation, previousAction);

    if (deviation > 0) {
      return { score: deviation, reasons: ["Action or sequence is historically rare for this agent."] };
    }
    
    return { score: 0, reasons: [] };
  }
}
