import { RawActionRequest } from "./models/Action";
export * from "./models/Action";
export * from "./models/Decision";
export * from "./models/ExecutionContract";
export declare class HeedError extends Error {
    decision: string;
    reasons: string[];
    constructor(message: string, decision?: string, reasons?: string[]);
}
export declare class Heed {
    private config;
    constructor(config: {
        agentId: string;
        runtimeUrl: string;
        executionId?: string;
        apiKey?: string;
    });
    execute(action: RawActionRequest): Promise<any>;
}
