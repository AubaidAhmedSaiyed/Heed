import { RawActionRequest, Action, Decision } from "@heed-ai/runtime";
import { RuntimeGateway } from "../runtime/RuntimeGateway";
import { InterventionManager } from "../interventions/InterventionManager";

export class ExecutionEngine {
  private gateway: RuntimeGateway;
  private interventionManager: InterventionManager;
  private states = new Map<string, string>(); // executionId -> status
  private pendingRequests = new Map<string, RawActionRequest>();

  constructor(gateway: RuntimeGateway, interventionManager: InterventionManager) {
    this.gateway = gateway;
    this.interventionManager = interventionManager;
  }

  async startExecution(executionId: string) {
    this.states.set(executionId, "RUNNING");
  }

  async handleAction(executionId: string, rawRequest: RawActionRequest): Promise<any> {
    const state = this.states.get(executionId);
    if (state !== "RUNNING" && state !== "AWAITING_APPROVAL") {
      throw new Error(`Cannot execute action in state: ${state}`);
    }

    try {
      const result = await this.gateway.processActionRequest("default-workspace", executionId, rawRequest);
      return result;
    } catch (error: any) {
      if (error.message.includes("requires human intervention")) {
        this.states.set(executionId, "AWAITING_APPROVAL");
        this.pendingRequests.set(executionId, rawRequest);
        throw error; // Let the caller (SDK) know we paused
      } else if (error.message.includes("Action blocked")) {
        this.states.set(executionId, "RUNNING"); // Resume from last valid state
        throw error;
      }
      throw error;
    }
  }

  async resumeExecution(executionId: string, interventionId: string, humanDecision: "ALLOW_ONCE" | "BLOCK" | "TERMINATE_EXECUTION") {
    const intervention = await this.interventionManager.resolveIntervention(interventionId, humanDecision);
    
    if (humanDecision === "TERMINATE_EXECUTION") {
      this.states.set(executionId, "TERMINATED");
      this.pendingRequests.delete(executionId);
      return { status: "TERMINATED" };
    }

    if (humanDecision === "BLOCK") {
      this.states.set(executionId, "RUNNING");
      this.pendingRequests.delete(executionId);
      return { status: "BLOCKED" };
    }

    if (humanDecision === "ALLOW_ONCE") {
      this.states.set(executionId, "RUNNING");
      const request = this.pendingRequests.get(executionId);
      if (request) {
        this.pendingRequests.delete(executionId);
        // Bypass gateway decision engine to execute directly
        // For MVP, we will inject a flag or execute directly via connector
        // Here we simplify by passing it again but ignoring blocks (or handle in gateway)
        // I will implement a force flag in gateway later, or execute here
        return { status: "RESUMED_AND_EXECUTED" }; 
      }
    }
  }
}
