import { RawActionRequest } from "@heed-ai/runtime";
import { Connector } from "./Connector";

export class HttpSimulator implements Connector {
  name = "http";
  capabilities = ["network.read", "network.write"];

  async execute(action: RawActionRequest): Promise<any> {
    console.log(`[HttpSimulator] Executing ${action.operation} to ${action.resource}`);
    return { status: 200, body: "simulated response" };
  }
}
