"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorManager = void 0;
class ConnectorManager {
    connectors = new Map();
    register(connector) {
        this.connectors.set(connector.name, connector);
    }
    async execute(action) {
        const connector = this.connectors.get(action.system)
            || (action.system === "fs-sim" ? this.connectors.get("filesystem") : undefined)
            || (action.system === "http-sim" ? this.connectors.get("http") : undefined);
        if (!connector) {
            throw new Error(`Connector not found for system: ${action.system}`);
        }
        return await connector.execute(action);
    }
}
exports.ConnectorManager = ConnectorManager;
