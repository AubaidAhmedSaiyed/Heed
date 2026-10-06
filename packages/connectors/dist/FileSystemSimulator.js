"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemSimulator = void 0;
class FileSystemSimulator {
    name = "filesystem";
    capabilities = ["file.read", "file.write", "tests.run"];
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
        console.log(`[FileSystemSimulator] Executing ${action.operation} on ${action.resource}`);
        if (action.operation === "read_file") {
            return { content: "// File content simulation" };
        }
        if (action.operation === "run_tests") {
            return { passed: true, total: 42 };
        }
        return { status: "simulated_success" };
    }
}
exports.FileSystemSimulator = FileSystemSimulator;
