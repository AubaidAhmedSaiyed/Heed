import { RawActionRequest } from "@heed/runtime";
import { Connector } from "./Connector";
export declare class ConnectorManager {
    private connectors;
    register(connector: Connector): void;
    execute(action: RawActionRequest): Promise<any>;
}
