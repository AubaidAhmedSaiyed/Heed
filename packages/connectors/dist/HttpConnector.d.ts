import { RawActionRequest } from "@heed/runtime";
import { Connector } from "./Connector";
export declare class HttpConnector implements Connector {
    name: string;
    capabilities: string[];
    execute(action: RawActionRequest): Promise<any>;
    private isInternalIP;
    private isPrivateIP;
}
