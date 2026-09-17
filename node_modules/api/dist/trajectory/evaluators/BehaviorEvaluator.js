"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BehaviorEvaluator = void 0;
const BehaviorEngine_1 = require("../../behavior/BehaviorEngine");
class BehaviorEvaluator {
    name = "BehaviorEvaluator";
    behaviorEngine = new BehaviorEngine_1.BehaviorEngine();
    async evaluate(context) {
        const { action, previousActions, contract } = context;
        const previousAction = previousActions?.length ? previousActions[previousActions.length - 1].operation : undefined;
        // Dummy agentId for MVP
        const deviation = await this.behaviorEngine.calculateDeviation("code-review-agent", action.operation, previousAction);
        if (deviation > 0) {
            return { score: deviation, reasons: ["Action or sequence is historically rare for this agent."] };
        }
        return { score: 0, reasons: [] };
    }
}
exports.BehaviorEvaluator = BehaviorEvaluator;
