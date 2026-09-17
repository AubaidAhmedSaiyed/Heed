import { RawActionRequest } from "@heed/runtime";
import { Connector } from "./Connector";
export declare class FileSystemSimulator implements Connector {
    name: string;
    capabilities: string[];
    execute(action: RawActionRequest): Promise<any>;
}
