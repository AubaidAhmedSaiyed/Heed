import { RawActionRequest } from "@heed-ai/runtime";
import { Connector } from "./Connector";

export class HttpSimulator implements Connector {
  name = "http";
  capabilities = ["network.read", "network.write"];

  
  getOperationMetadata(operation: string, capability?: string) {
    if (operation.includes("read") || operation.includes("get") || operation.includes("list") || operation.includes("search")) {
      return {
        reversibility: "REVERSIBLE" as const,
        impactWeight: 1 as const,
        dataSensitivity: "PUBLIC" as const,
        trustEffect: "NONE" as const,
        compensationAvailable: false
      };
    }
    if (operation.includes("write") || operation.includes("edit") || operation.includes("update") || operation.includes("commit")) {
      return {
        reversibility: "REVERSIBLE" as const,
        impactWeight: 3 as const,
        dataSensitivity: "INTERNAL" as const,
        trustEffect: "NONE" as const,
        compensationAvailable: true
      };
    }
    if (operation.includes("delete") || operation.includes("merge")) {
      return {
        reversibility: "IRREVERSIBLE" as const,
        impactWeight: 10 as const,
        dataSensitivity: "INTERNAL" as const,
        trustEffect: "NONE" as const,
        compensationAvailable: false
      };
    }
    if (operation.includes("deploy") || operation.includes("export")) {
      return {
        reversibility: "IRREVERSIBLE" as const,
        impactWeight: 25 as const,
        dataSensitivity: "RESTRICTED" as const,
        trustEffect: "EXTERNAL_DESTINATION" as const,
        compensationAvailable: false
      };
    }
    // Fallback
    return {
      reversibility: "UNKNOWN" as const,
      impactWeight: 3 as const,
      dataSensitivity: "INTERNAL" as const,
      trustEffect: "NONE" as const,
      compensationAvailable: false
    };
  }

  async compensate(action: RawActionRequest): Promise<any> {
    console.log(`[${this.name}] Compensating ${action.operation}`);
    return { status: "compensated", operation: action.operation };
  }
  
  async execute(action: RawActionRequest): Promise<any> {
    console.log(`[HttpSimulator] Executing ${action.operation} to ${action.resource}`);
    return { status: 200, body: "simulated response" };
  }
}
