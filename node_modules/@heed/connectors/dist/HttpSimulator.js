"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpSimulator = void 0;
class HttpSimulator {
    name = "http";
    capabilities = ["network.read", "network.write"];
    async execute(action) {
        console.log(`[HttpSimulator] Executing ${action.operation} to ${action.resource}`);
        return { status: 200, body: "simulated response" };
    }
}
exports.HttpSimulator = HttpSimulator;
