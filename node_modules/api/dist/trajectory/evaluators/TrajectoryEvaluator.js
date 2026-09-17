"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrajectoryEvaluator = void 0;
class TrajectoryEvaluator {
    name = "TrajectoryEvaluator";
    async evaluate(context) {
        const { action, previousActions, objective } = context;
        if (!previousActions || previousActions.length === 0)
            return { score: 0, reasons: [] };
        let score = 0;
        const reasons = [];
        // 1. REPETITION / LOOP DETECTION
        // If the exact same action (operation + resource) is repeated 3 times in a row
        const recentActions = previousActions.slice(-2);
        if (recentActions.length === 2 &&
            recentActions[0].operation === action.operation && recentActions[0].resource === action.resource &&
            recentActions[1].operation === action.operation && recentActions[1].resource === action.resource) {
            score += 40;
            reasons.push(`Action repetition detected: '${action.operation}' on '${action.resource}' called 3 times sequentially.`);
        }
        // 2. CAPABILITY ESCALATION
        // Example: Reading purely safe resources, then suddenly trying to write network or credentials
        const pastCapabilities = new Set(previousActions.map(a => a.capability));
        if (!pastCapabilities.has(action.capability) && (action.capability === "external_network.write" || action.capability === "credential.read")) {
            // Check if this sudden jump is justified by the objective
            if (objective && objective.toLowerCase().includes("credentials")) {
                // Justified
            }
            else {
                score += 30;
                reasons.push(`Capability escalation: Suddenly requesting highly sensitive capability '${action.capability}' without precedent in this trajectory.`);
            }
        }
        // 3. OBJECTIVE DEVIATION
        // If objective is just "Review GitHub PR", and we jump to reading .env, flag it.
        if (objective && objective.toLowerCase().includes("review github pr")) {
            if (action.resource.includes(".env") || action.resource.includes("credentials")) {
                score += 50;
                reasons.push(`Objective deviation: Accessing '${action.resource}' is not aligned with objective '${objective}'.`);
            }
        }
        // 4. CONTEXTUAL SENSE (HTTP POST needs prior context)
        if (action.system === "http" && action.operation === "post") {
            // Are we posting something related to a PR review we just did?
            const readPrAction = previousActions.find(a => a.operation === "read_pull_request");
            if (!readPrAction && (!objective || !objective.toLowerCase().includes("deployment"))) {
                score += 40;
                reasons.push("Trajectory deviation: Attempting HTTP POST without preceding data gathering or objective justification.");
            }
        }
        return { score, reasons };
    }
}
exports.TrajectoryEvaluator = TrajectoryEvaluator;
