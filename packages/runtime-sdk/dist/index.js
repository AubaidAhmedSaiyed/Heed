"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Heed = void 0;
__exportStar(require("./models/Action"), exports);
__exportStar(require("./models/Decision"), exports);
__exportStar(require("./models/ExecutionContract"), exports);
class Heed {
    config;
    constructor(config) {
        this.config = config;
    }
    async execute(action) {
        const url = `${this.config.runtimeUrl}/api/executions/${this.config.executionId}/actions`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Agent-Id": this.config.agentId
            },
            body: JSON.stringify(action)
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Rethen runtime error: ${error.message || response.statusText}`);
        }
        const result = await response.json();
        return result;
    }
}
exports.Heed = Heed;
