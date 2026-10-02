import { RawActionRequest } from "@heed-ai/runtime";
import { Connector } from "./Connector";
export declare class GitHubSimulator implements Connector {
    name: string;
    capabilities: string[];
    execute(action: RawActionRequest): Promise<any>;
}
