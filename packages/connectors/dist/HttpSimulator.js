"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpSimulator = void 0;
class HttpSimulator {
    name = "http";
    capabilities = ["network.read", "network.write"];
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
        console.log(`[HttpSimulator] Executing ${action.operation} to ${action.resource}`);
        return { status: 200, body: "simulated response" };
    }
}
exports.HttpSimulator = HttpSimulator;
