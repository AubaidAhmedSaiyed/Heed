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
exports.Heed = exports.ProvenanceManager = exports.HeedError = void 0;
const Provenance_1 = require("./models/Provenance");
__exportStar(require("./models/Action"), exports);
__exportStar(require("./models/Decision"), exports);
__exportStar(require("./models/ExecutionContract"), exports);
__exportStar(require("./models/Provenance"), exports);
__exportStar(require("./models/Destination"), exports);
__exportStar(require("./models/Authority"), exports);
__exportStar(require("./models/Policy"), exports);
__exportStar(require("./models/ApprovalBinding"), exports);
class HeedError extends Error {
    decision;
    reasons;
    constructor(message, decision = "BLOCK", reasons = []) {
        super(message);
        this.name = "HeedError";
        this.decision = decision;
        this.reasons = reasons;
    }
}
exports.HeedError = HeedError;
// Global active provenance context for the current execution
let currentExecutionProvenance = (0, Provenance_1.emptyProvenance)();
class ProvenanceManager {
    /** Mark a specific value (or the execution context) with provenance labels */
    mark(labels, source) {
        currentExecutionProvenance = (0, Provenance_1.mergeProvenance)(currentExecutionProvenance, (0, Provenance_1.createProvenance)(labels, source));
    }
    /** Retrieve the active provenance context */
    getContext() {
        return currentExecutionProvenance;
    }
    /** Reset provenance (useful for testing or boundary resets) */
    reset() {
        currentExecutionProvenance = (0, Provenance_1.emptyProvenance)();
    }
    /** Apply an authorized security transformation to the current data context */
    applyTrustedTransformation(transformationId, outputLabels, reason) {
        // In a full implementation, this might call the HEED API to verify the transformationId is allowed by policy
        // For now, we explicitly log the transformation in the context and replace the labels.
        currentExecutionProvenance = {
            entries: [
                ...currentExecutionProvenance.entries,
                { labels: outputLabels, source: `transformation:${transformationId}`, timestamp: new Date().toISOString() }
            ],
            activeLabels: outputLabels
        };
        console.log(`[Provenance] Applied trusted transformation '${transformationId}'. Reason: ${reason}. New labels: ${outputLabels.join(",")}`);
    }
}
exports.ProvenanceManager = ProvenanceManager;
class Heed {
    config;
    provenance = new ProvenanceManager();
    constructor(config) {
        this.config = config;
    }
    /** Set the execution ID for this SDK instance */
    setExecutionId(id) {
        this.config.executionId = id;
    }
    /** Creates a new execution in the HEED runtime */
    async createExecution(objective, contract, authority) {
        const url = `${this.config.runtimeUrl}/api/executions`;
        const headers = this.getHeaders();
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({ objective, contract, authority })
        });
        if (!response.ok) {
            throw new Error(`Failed to create execution: ${response.statusText}`);
        }
        const result = await response.json();
        this.config.executionId = result.id;
        return result.id;
    }
    /** Execute an action against the runtime firewall */
    async execute(action) {
        if (!this.config.executionId) {
            throw new Error("Execution ID is not set. Call createExecution or setExecutionId first.");
        }
        const url = `${this.config.runtimeUrl}/api/executions/${this.config.executionId}/actions`;
        const headers = this.getHeaders();
        // Attach current accumulated provenance labels to the outbound request
        const context = this.provenance.getContext();
        const requestPayload = {
            ...action,
            provenanceLabels: context.activeLabels,
            provenanceSource: context.entries.map(e => e.source).filter(Boolean).join(",") || undefined
        };
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(requestPayload)
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new HeedError(`HEED runtime error: ${error.error || error.message || response.statusText}`, error.decision, error.reasons);
        }
        const result = await response.json();
        return result.data;
    }
    /** Wrap an existing tool/function with HEED runtime evaluation */
    wrapTool(toolFn, metadata) {
        return async (...args) => {
            // 1. Ask HEED to evaluate the action BEFORE local tool execution
            const actionReq = {
                system: metadata.system,
                operation: metadata.operation,
                resource: metadata.resource,
                capability: metadata.capability,
                destinationType: metadata.destination?.type,
                destinationIdentifier: metadata.destination?.identifier,
                arguments: args.length > 1 ? { args } : (args[0] || {})
            };
            // If execute throws, the action is blocked/prevented
            await this.execute(actionReq);
            // 2. Actually execute the local tool
            return await toolFn(...args);
        };
    }
    getHeaders() {
        const headers = {
            "Content-Type": "application/json",
            "X-Agent-Id": this.config.agentId
        };
        if (this.config.apiKey) {
            headers["Authorization"] = `Bearer ${this.config.apiKey}`;
        }
        return headers;
    }
}
exports.Heed = Heed;
