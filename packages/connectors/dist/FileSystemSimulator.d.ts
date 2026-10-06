import { RawActionRequest } from "@heed-ai/runtime";
import { Connector } from "./Connector";
export declare class FileSystemSimulator implements Connector {
    name: string;
    capabilities: string[];
    getOperationMetadata(operation: string, capability?: string): {
        reversibility: "REVERSIBLE";
        impactWeight: 1;
        dataSensitivity: "PUBLIC";
        trustEffect: "NONE";
        compensationAvailable: boolean;
    } | {
        reversibility: "REVERSIBLE";
        impactWeight: 3;
        dataSensitivity: "INTERNAL";
        trustEffect: "NONE";
        compensationAvailable: boolean;
    } | {
        reversibility: "IRREVERSIBLE";
        impactWeight: 10;
        dataSensitivity: "INTERNAL";
        trustEffect: "NONE";
        compensationAvailable: boolean;
    } | {
        reversibility: "IRREVERSIBLE";
        impactWeight: 25;
        dataSensitivity: "RESTRICTED";
        trustEffect: "EXTERNAL_DESTINATION";
        compensationAvailable: boolean;
    } | {
        reversibility: "UNKNOWN";
        impactWeight: 3;
        dataSensitivity: "INTERNAL";
        trustEffect: "NONE";
        compensationAvailable: boolean;
    };
    compensate(action: RawActionRequest): Promise<any>;
    execute(action: RawActionRequest): Promise<any>;
}
