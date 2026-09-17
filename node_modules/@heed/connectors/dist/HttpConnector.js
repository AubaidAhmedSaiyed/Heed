"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpConnector = void 0;
class HttpConnector {
    name = "http";
    capabilities = ["external_network.read", "external_network.write"];
    async execute(action) {
        console.log(`[HttpConnector] Executing real API call for ${action.operation} on ${action.resource}`);
        try {
            const url = action.arguments.url;
            const method = action.arguments.method || "GET";
            const headers = action.arguments.headers || {};
            const body = action.arguments.body ? JSON.stringify(action.arguments.body) : undefined;
            const response = await fetch(url, {
                method,
                headers,
                body
            });
            const responseData = await response.text();
            let parsed;
            try {
                parsed = JSON.parse(responseData);
            }
            catch (e) {
                parsed = responseData;
            }
            return {
                status: response.status,
                data: parsed
            };
        }
        catch (error) {
            throw new Error(`Http Connector Error: ${error.message}`);
        }
    }
}
exports.HttpConnector = HttpConnector;
