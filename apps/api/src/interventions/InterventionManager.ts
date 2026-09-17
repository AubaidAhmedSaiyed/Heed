import { Action, Decision } from "@heed/runtime";
import { EventEmitter } from "events";

export interface PendingIntervention {
  id: string;
  executionId: string;
  action: Action;
  decision: Decision;
  status: "PENDING" | "RESOLVED";
  humanDecision?: "ALLOW_ONCE" | "BLOCK" | "TERMINATE_EXECUTION";
}

export class InterventionManager extends EventEmitter {
  private interventions: Map<string, PendingIntervention> = new Map();

  async createIntervention(executionId: string, action: Action, decision: Decision): Promise<PendingIntervention> {
    const id = `inv-${Math.random().toString(36).substring(2, 9)}`;
    const intervention: PendingIntervention = {
      id,
      executionId,
      action,
      decision,
      status: "PENDING"
    };
    this.interventions.set(id, intervention);
    return intervention;
  }

  async resolveIntervention(id: string, humanDecision: "ALLOW_ONCE" | "BLOCK" | "TERMINATE_EXECUTION") {
    const intervention = this.interventions.get(id);
    if (!intervention) throw new Error("Intervention not found");
    
    intervention.status = "RESOLVED";
    intervention.humanDecision = humanDecision;
    this.emit(`resolved:${id}`, humanDecision);
    return intervention;
  }

  getPendingInterventions() {
    return Array.from(this.interventions.values()).filter(i => i.status === "PENDING");
  }
}
