"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensitivityEvaluator = void 0;
class SensitivityEvaluator {
    name = "SensitivityEvaluator";
    async evaluate(context) {
        const { action } = context;
        let score = 0;
        const reasons = [];
        if (action.sensitivity === "RESTRICTED") {
            score += 30;
            reasons.push("Action targets a RESTRICTED resource.");
        }
        else if (action.sensitivity === "CONFIDENTIAL") {
            score += 15;
            reasons.push("Action targets a CONFIDENTIAL resource.");
        }
        return { score, reasons };
    }
}
exports.SensitivityEvaluator = SensitivityEvaluator;
