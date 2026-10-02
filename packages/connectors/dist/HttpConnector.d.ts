import { RawActionRequest } from "@heed-ai/runtime";
import { Connector } from "./Connector";
export declare class HttpConnector implements Connector {
    name: string;
    capabilities: string[];
    execute(action: RawActionRequest): Promise<any>;
    private isInternalIP;
    private isPrivateIP;
}
