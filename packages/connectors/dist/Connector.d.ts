import { RawActionRequest } from "@heed-ai/runtime";
export interface OperationMetadata {
    reversibility: "REVERSIBLE" | "IRREVERSIBLE" | "UNKNOWN";
    impactWeight: 1 | 3 | 10 | 25;
    dataSensitivity: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
    trustEffect: "NONE" | "UNTRUSTED_INPUT" | "SENSITIVE_DATA" | "EXTERNAL_DESTINATION";
    compensationAvailable: boolean;
}
export interface Connector {
    name: string;
    capabilities: string[];
    getOperationMetadata(operation: string, capability?: string): OperationMetadata;
    execute(action: RawActionRequest): Promise<any>;
    compensate?(action: RawActionRequest): Promise<any>;
}
