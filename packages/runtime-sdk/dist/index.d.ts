import { RawActionRequest } from "./models/Action";
import { ProvenanceLabel, ProvenanceContext } from "./models/Provenance";
import { ExecutionContract } from "./models/ExecutionContract";
import { AuthorityContext } from "./models/Authority";
export * from "./models/Action";
export * from "./models/Decision";
export * from "./models/ExecutionContract";
export * from "./models/Provenance";
export * from "./models/Destination";
export * from "./models/Authority";
export * from "./models/Policy";
export * from "./models/ApprovalBinding";
export declare class HeedError extends Error {
    decision: string;
    reasons: string[];
    constructor(message: string, decision?: string, reasons?: string[]);
}
export declare class ProvenanceManager {
    /** Mark a specific value (or the execution context) with provenance labels */
    mark(labels: ProvenanceLabel[], source?: string): void;
    /** Retrieve the active provenance context */
    getContext(): ProvenanceContext;
    /** Reset provenance (useful for testing or boundary resets) */
    reset(): void;
    /** Apply an authorized security transformation to the current data context */
    applyTrustedTransformation(transformationId: string, outputLabels: ProvenanceLabel[], reason: string): void;
}
export declare class Heed {
    private config;
    provenance: ProvenanceManager;
    constructor(config: {
        agentId: string;
        runtimeUrl: string;
        executionId?: string;
        apiKey?: string;
    });
    /** Set the execution ID for this SDK instance */
    setExecutionId(id: string): void;
    /** Creates a new execution in the HEED runtime */
    createExecution(objective: string, contract: ExecutionContract, authority?: AuthorityContext): Promise<string>;
    /** Execute an action against the runtime firewall */
    execute<T = any>(action: Omit<RawActionRequest, "provenanceLabels">): Promise<T>;
    /** Wrap an existing tool/function with HEED runtime evaluation */
    wrapTool<TArgs extends any[], TReturn>(toolFn: (...args: TArgs) => Promise<TReturn>, metadata: {
        system: string;
        operation: string;
        resource: string;
        capability?: string;
        destination?: {
            type: string;
            identifier: string;
        };
    }): (...args: TArgs) => Promise<TReturn>;
    private getHeaders;
}
