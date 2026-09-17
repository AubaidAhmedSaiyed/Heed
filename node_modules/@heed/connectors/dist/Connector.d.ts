import { RawActionRequest } from "@heed/runtime";
export interface Connector {
    name: string;
    capabilities: string[];
    execute(action: RawActionRequest): Promise<any>;
}
