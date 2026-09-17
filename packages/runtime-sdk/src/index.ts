import { RawActionRequest } from "./models/Action";
export * from "./models/Action";
export * from "./models/Decision";
export * from "./models/ExecutionContract";

export class HeedError extends Error {
  public decision: string;
  public reasons: string[];

  constructor(message: string, decision: string = "BLOCK", reasons: string[] = []) {
    super(message);
    this.name = "HeedError";
    this.decision = decision;
    this.reasons = reasons;
  }
}

export class Heed {
  private config: { agentId: string; runtimeUrl: string; executionId?: string; apiKey?: string };

  constructor(config: { agentId: string; runtimeUrl: string; executionId?: string; apiKey?: string }) {
    this.config = config;
  }

  async execute(action: RawActionRequest): Promise<any> {
    const url = `${this.config.runtimeUrl}/api/executions/${this.config.executionId}/actions`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Agent-Id": this.config.agentId
    };
    
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(action)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new HeedError(
        `HEED runtime error: ${error.error || error.message || response.statusText}`,
        error.decision,
        error.reasons
      );
    }

    const result = await response.json();
    return result;
  }
}
