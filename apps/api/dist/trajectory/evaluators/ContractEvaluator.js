"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractEvaluator = void 0;
class ContractEvaluator {
    name = "ContractEvaluator";
    priority = 10; // High priority for contract violations
    async evaluate(context) {
        const { action, contract } = context;
        if (!contract)
            return { score: 0, reasons: [] };
        let score = 0;
        const reasons = [];
        let isBlocked = false;
        if (contract.allowedSystems && contract.allowedSystems.length > 0 && !contract.allowedSystems.includes(action.system)) {
            score += 40;
            reasons.push(`System '${action.system}' is not in allowed systems.`);
            isBlocked = true;
        }
        if (contract.allowedCapabilities && contract.allowedCapabilities.length > 0 && !contract.allowedCapabilities.includes(action.capability || '')) {
            score += 30;
            reasons.push(`Capability '${action.capability}' is not in allowed capabilities.`);
            isBlocked = true;
        }
        // Checking against restricted resources (naive string check for MVP)
        const isRestricted = (contract.restrictedResources || []).some(res => action.resource.includes(res));
        if (isRestricted) {
            score += 50;
            reasons.push(`Resource '${action.resource}' matches restricted resources.`);
            isBlocked = true;
        }
        if (score === 0) {
            if (contract.expectedActions.includes(action.operation)) {
                score -= 20;
            }
        }
        // 5. EXECUTION BUDGETS
        if (contract.maxActions !== undefined && contract.maxActions !== null) {
            if ((context.previousActions?.length || 0) >= contract.maxActions) {
                score += 100;
                reasons.push(`[EXECUTION_LIMIT] Maximum action budget exceeded (${contract.maxActions}).`);
            }
        }
        if (contract.maxExternalWrites !== undefined && contract.maxExternalWrites !== null && action.capability?.includes('.write')) {
            const pastWrites = (context.previousActions || []).filter(a => a.capability?.includes('.write')).length;
            if (pastWrites >= contract.maxExternalWrites) {
                score += 80;
                reasons.push(`[EXECUTION_LIMIT] Maximum external writes budget exceeded (${contract.maxExternalWrites}).`);
                isBlocked = true;
            }
        }
        return { score, reasons, decision: isBlocked ? "BLOCK" : undefined };
    }
}
exports.ContractEvaluator = ContractEvaluator;
