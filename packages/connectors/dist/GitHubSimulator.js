"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubSimulator = void 0;
class GitHubSimulator {
    name = "github";
    capabilities = ["repository.read", "pull_request.read", "review.write"];
    getOperationMetadata(operation, capability) {
        if (operation.includes("read") || operation.includes("get") || operation.includes("list") || operation.includes("search")) {
            return {
                reversibility: "REVERSIBLE",
                impactWeight: 1,
                dataSensitivity: "PUBLIC",
                trustEffect: "NONE",
                compensationAvailable: false
            };
        }
        if (operation.includes("write") || operation.includes("edit") || operation.includes("update") || operation.includes("commit")) {
            return {
                reversibility: "REVERSIBLE",
                impactWeight: 3,
                dataSensitivity: "INTERNAL",
                trustEffect: "NONE",
                compensationAvailable: true
            };
        }
        if (operation.includes("delete") || operation.includes("merge")) {
            return {
                reversibility: "IRREVERSIBLE",
                impactWeight: 10,
                dataSensitivity: "INTERNAL",
                trustEffect: "NONE",
                compensationAvailable: false
            };
        }
        if (operation.includes("deploy") || operation.includes("export")) {
            return {
                reversibility: "IRREVERSIBLE",
                impactWeight: 25,
                dataSensitivity: "RESTRICTED",
                trustEffect: "EXTERNAL_DESTINATION",
                compensationAvailable: false
            };
        }
        // Fallback
        return {
            reversibility: "UNKNOWN",
            impactWeight: 3,
            dataSensitivity: "INTERNAL",
            trustEffect: "NONE",
            compensationAvailable: false
        };
    }
    async compensate(action) {
        console.log(`[${this.name}] Compensating ${action.operation}`);
        return { status: "compensated", operation: action.operation };
    }
    async execute(action) {
        console.log(`[GitHubSimulator] Executing ${action.operation} on ${action.resource}`);
        if (action.operation === "fetch_pr") {
            return { id: 482, title: "Add Rethen Runtime", diff: "+ const runtime = true;" };
        }
        if (action.operation === "post_review") {
            return { status: "success", commentId: 1001 };
        }
        return { status: "simulated_success" };
    }
}
exports.GitHubSimulator = GitHubSimulator;
