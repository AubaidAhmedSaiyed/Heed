import { RawActionRequest, Action } from "./models/Action";
import { ProvenanceLabel, ProvenanceContext, createProvenance, emptyProvenance, mergeProvenance, propagateProvenance } from "./models/Provenance";
import { ExecutionContract, ExecutionContractInput, ExecutionContractSchema } from "./models/ExecutionContract";
import { AuthorityContext } from "./models/Authority";
import { Decision } from "./models/Decision";
import { z } from "zod";

export * from "./models/Action";
export * from "./models/Decision";
export * from "./models/ExecutionContract";
export * from "./models/Provenance";
export * from "./models/Destination";
export * from "./models/Authority";
export * from "./models/Policy";
export * from "./models/ApprovalBinding";

export class HeedError extends Error {
  public decision: string;
  public reasons: string[];

  constructor(message: string, decision: string = "BLOCK", reasons: string[] = []) {
    super(
      `${message}\n\nDecision: ${decision}\nReasons:\n${reasons.map(r => `  - ${r}`).join("\n")}`
    );
    this.name = "HeedError";
    this.decision = decision;
    this.reasons = reasons;
  }
}

// Global active provenance context for the current execution
let currentExecutionProvenance: ProvenanceContext = emptyProvenance();

export class ProvenanceManager {
  /** Mark a specific value (or the execution context) with provenance labels */
  mark(labels: ProvenanceLabel[], source?: string): void {
    currentExecutionProvenance = mergeProvenance(
      currentExecutionProvenance,
      createProvenance(labels, source)
    );
  }

  /** Retrieve the active provenance context */
  getContext(): ProvenanceContext {
    return currentExecutionProvenance;
  }
  
  /** Reset provenance (useful for testing or boundary resets) */
  reset(): void {
    currentExecutionProvenance = emptyProvenance();
  }

  /** Apply an authorized security transformation to the current data context */
  applyTrustedTransformation(transformationId: string, outputLabels: ProvenanceLabel[], reason: string): void {
    // In a full implementation, this might call the HEED API to verify the transformationId is allowed by policy
    // For now, we explicitly log the transformation in the context and replace the labels.
    currentExecutionProvenance = {
      entries: [
        ...currentExecutionProvenance.entries,
        { labels: outputLabels, source: `transformation:${transformationId}`, timestamp: new Date().toISOString() }
      ],
      activeLabels: outputLabels
    };
    console.log(`[Provenance] Applied trusted transformation '${transformationId}'. Reason: ${reason}. New labels: ${outputLabels.join(",")}`);
  }
}

export interface HeedConfig {
  apiKey?: string;
  runtimeUrl?: string;
  agentId?: string;
  executionId?: string;
}

export class Heed {
  private config: { agentId: string; runtimeUrl: string; executionId?: string; apiKey?: string };
  public provenance = new ProvenanceManager();

  constructor(config: HeedConfig = {}) {
    const envUrl = typeof process !== "undefined" && process?.env?.HEED_RUNTIME_URL 
      ? process.env.HEED_RUNTIME_URL 
      : undefined;
    const envKey = typeof process !== "undefined" && process?.env?.HEED_API_KEY 
      ? process.env.HEED_API_KEY 
      : undefined;

    this.config = {
      agentId: config.agentId || "default-agent",
      runtimeUrl: (config.runtimeUrl || envUrl || "http://localhost:4000").replace(/\/$/, ""),
      executionId: config.executionId,
      apiKey: config.apiKey || envKey
    };
  }

  /** Set the execution ID for this SDK instance */
  setExecutionId(id: string) {
    this.config.executionId = id;
  }

  /** Creates a new execution in the HEED runtime */
  async createExecution(objective: string, contract?: ExecutionContractInput, authority?: AuthorityContext): Promise<string> {
    const url = `${this.config.runtimeUrl}/api/executions`;
    const headers = this.getHeaders();
    
    const parsedContract = contract ? ExecutionContractSchema.parse(contract) : { objective };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ objective, contract: parsedContract, authority })
    }).catch((e) => {
      throw new Error(`Unable to reach HEED at ${this.config.runtimeUrl}.\nCheck HEED_URL and network connectivity.\nDetails: ${e.message}`);
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error(!this.config.apiKey ? `HEED_API_KEY is required.` : (errBody?.error?.message || errBody?.error || `HEED authentication failed. Check your API key.`));
      }
      if (response.status === 404) {
        throw new Error(`The configured HEED agent could not be found.`);
      }
      throw new Error(`Failed to create execution: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    this.config.executionId = result.id;
    return result.id;
  }

  /** Execute an action against the runtime firewall */
  async execute<T = any>(action: Omit<RawActionRequest, "provenanceLabels">): Promise<T> {
    if (!this.config.executionId) {
      await this.createExecution("Direct SDK Execution", {
        objective: "Direct SDK Execution"
      });
    }
    
    const url = `${this.config.runtimeUrl}/api/executions/${this.config.executionId}/actions`;
    const headers = this.getHeaders();
    
    // Attach current accumulated provenance labels to the outbound request
    const context = this.provenance.getContext();
    const requestPayload: RawActionRequest = {
      ...action,
      provenanceLabels: context.activeLabels,
      provenanceSource: context.entries.map(e => e.source).filter(Boolean).join(",") || undefined
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestPayload)
    }).catch((e) => {
      throw new Error(`Unable to reach HEED at ${this.config.runtimeUrl}.\nCheck HEED_URL and network connectivity.\nDetails: ${e.message}`);
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const decision = errBody.decision || (response.status === 401 ? "UNAUTHORIZED" : "BLOCK");
      const reasons = errBody.reasons || [];
      const errorMsg = typeof errBody.error === "object" && errBody.error?.message
        ? errBody.error.message
        : (typeof errBody.error === "string" ? errBody.error : errBody.message || `Action rejected by HEED (${response.status})`);

      if (decision === "ASK" || decision === "BOUND_APPROVAL") {
        throw new HeedError(
          `Action requires human approval.\n\nExecution: ${this.config.executionId}\nAction: ${action.operation}\nStatus: AWAITING_APPROVAL`,
          decision,
          reasons
        );
      }

      throw new HeedError(errorMsg, decision, reasons);
    }

    const result = await response.json();
    return result.data as T;
  }

  /** Wrap an existing tool/function with HEED runtime evaluation */
  wrapTool<TArgs extends any[], TReturn>(
    toolFn: (...args: TArgs) => Promise<TReturn>,
    metadata: { system: string; operation: string; resource: string; capability?: string; destination?: { type: string, identifier: string } }
  ): (...args: TArgs) => Promise<TReturn> {
    return async (...args: TArgs): Promise<TReturn> => {
      // 1. Ask HEED to evaluate the action BEFORE local tool execution
      const actionReq = {
        system: metadata.system,
        operation: metadata.operation,
        resource: metadata.resource,
        capability: metadata.capability,
        destinationType: metadata.destination?.type,
        destinationIdentifier: metadata.destination?.identifier,
        arguments: args.length > 1 ? { args } : (args[0] || {})
      } as any;
      
      // If execute throws, the action is blocked/prevented
      await this.execute(actionReq);
      
      // 2. Actually execute the local tool
      return await toolFn(...args);
    };
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Agent-Id": this.config.agentId
    };
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }
    return headers;
  }
}
