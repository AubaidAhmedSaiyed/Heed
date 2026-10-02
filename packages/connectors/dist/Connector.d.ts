import { RawActionRequest } from "@heed-ai/runtime";
export interface Connector {
    name: string;
    capabilities: string[];
    execute(action: RawActionRequest): Promise<any>;
}
