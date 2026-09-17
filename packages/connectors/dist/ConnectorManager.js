"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorManager = void 0;
class ConnectorManager {
    connectors = new Map();
    register(connector) {
        this.connectors.set(connector.name, connector);
    }
    async execute(action) {
        const connector = this.connectors.get(action.system);
        if (!connector) {
            throw new Error(`Connector not found for system: ${action.system}`);
        }
        return await connector.execute(action);
    }
}
exports.ConnectorManager = ConnectorManager;
