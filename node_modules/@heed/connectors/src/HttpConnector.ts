import { RawActionRequest } from "@heed/runtime";
import { Connector } from "./Connector";

export class HttpConnector implements Connector {
  name = "http";
  capabilities = ["external_network.read", "external_network.write"];

  async execute(action: RawActionRequest): Promise<any> {
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
      } catch (e) {
        parsed = responseData;
      }

      return {
        status: response.status,
        data: parsed
      };
    } catch (error: any) {
      throw new Error(`Http Connector Error: ${error.message}`);
    }
  }
}
