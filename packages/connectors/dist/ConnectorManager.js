"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorManager = void 0;
class ConnectorManager {
    connectors = new Map();
    register(connector) {
        this.connectors.set(connector.name, connector);
    }
    getConnector(system) {
        const s = system.toLowerCase();
        return this.connectors.get(s)
            || (s === "postgresql" || s === "database" || s === "db" ? this.connectors.get("postgres") : undefined)
            || (s === "fs-sim" ? this.connectors.get("filesystem") : undefined)
            || (s === "http-sim" ? this.connectors.get("http") : undefined);
    }
    async execute(action) {
        const connector = this.getConnector(action.system);
        if (!connector) {
            // If HEED backend doesn't have a connector for this system, it's an external custom tool.
            // We approve the execution from HEED's perspective so the SDK can execute it locally.
            console.log("[ConnectorManager] External/Unknown system " + action.system + ". Bypassing local execution.");
            return { status: "external_execution_approved" };
        }
        return await connector.execute(action);
    }
}
exports.ConnectorManager = ConnectorManager;
