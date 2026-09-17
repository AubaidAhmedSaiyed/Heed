"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequenceEvaluator = void 0;
class SequenceEvaluator {
    name = "SequenceEvaluator";
    async evaluate(context) {
        const { action, previousActions } = context;
        if (!previousActions || previousActions.length === 0)
            return { score: 0, reasons: [] };
        const prevAction = previousActions[previousActions.length - 1];
        // Very basic naive sequence checking for MVP
        let score = 0;
        const reasons = [];
        // e.g. read_tests -> read_env is unexpected
        if (prevAction.operation === "read_tests" && action.resource.includes(".env")) {
            score += 40;
            reasons.push(`Unexpected transition from ${prevAction.operation} to accessing ${action.resource}`);
        }
        return { score, reasons };
    }
}
exports.SequenceEvaluator = SequenceEvaluator;
