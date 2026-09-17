import { RawActionRequest } from "@heed/runtime";
import { Connector } from "./Connector";
export declare class GitHubConnector implements Connector {
    name: string;
    capabilities: string[];
    private octokit;
    constructor();
    execute(action: RawActionRequest): Promise<any>;
}
