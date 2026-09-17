import { RawActionRequest } from "./models/Action";
export * from "./models/Action";
export * from "./models/Decision";
export * from "./models/ExecutionContract";
export declare class Heed {
    private config;
    constructor(config: {
        agentId: string;
        runtimeUrl: string;
        executionId?: string;
    });
    execute(action: RawActionRequest): Promise<any>;
}
