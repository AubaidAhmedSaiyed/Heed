"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityEvaluator = void 0;
class CapabilityEvaluator {
    name = "CapabilityEvaluator";
    async evaluate(context) {
        const { action } = context;
        let score = 0;
        const reasons = [];
        // Capability escalation checks
        if (action.capability === "external_network.write" || action.capability === "deployment.execute") {
            score += 50;
            reasons.push(`Action requires highly privileged capability: ${action.capability}`);
        }
        return { score, reasons };
    }
}
exports.CapabilityEvaluator = CapabilityEvaluator;
