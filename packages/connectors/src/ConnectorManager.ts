import { RawActionRequest } from "@heed-ai/runtime";
import { Connector } from "./Connector";

export class ConnectorManager {
  private connectors: Map<string, Connector> = new Map();

  register(connector: Connector) {
    this.connectors.set(connector.name, connector);
  }

  async execute(action: RawActionRequest): Promise<any> {
    const connector = this.connectors.get(action.system);
    if (!connector) {
      throw new Error(`Connector not found for system: ${action.system}`);
    }
    return await connector.execute(action);
  }
}
