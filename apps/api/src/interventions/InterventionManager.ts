import { Action, Decision } from "@heed-ai/runtime";
import { EventEmitter } from "events";

export interface PendingIntervention {
  id: string;
  executionId: string;
  action: Action;
  decision: Decision;
  status: "PENDING" | "RESOLVED";
  humanDecision?: "ALLOW_ONCE" | "BLOCK" | "TERMINATE_EXECUTION";
}

import { PrismaClient } from "@prisma/client";

export class InterventionManager extends EventEmitter {
  private interventions: Map<string, PendingIntervention> = new Map();
  private prisma?: PrismaClient;

  constructor(prisma?: PrismaClient) {
    super();
    this.prisma = prisma as any;
  }

  async createIntervention(workspaceId: string, executionId: string, action: Action, decision: Decision, actionEventId: string): Promise<PendingIntervention> {
    const id = `inv-${Math.random().toString(36).substring(2, 9)}`;
    const intervention: PendingIntervention = {
      id,
      executionId,
      action,
      decision,
      status: "PENDING"
    };
    this.interventions.set(id, intervention);

    if (this.prisma?.intervention) {
      await this.prisma.intervention.create({
        data: {
          id,
          executionId,
          actionEventId,
          status: "PENDING",
          reason: decision.reasons[0] || "Requires approval"
        }
      }).catch(() => {});
    }

    return intervention;
  }

  async resolveIntervention(id: string, humanDecision: "ALLOW_ONCE" | "BLOCK" | "TERMINATE_EXECUTION") {
    if (this.prisma?.intervention) {
      const res = await this.prisma.intervention.updateMany({
        where: { id, status: "PENDING" },
        data: {
          status: "RESOLVED",
          humanDecision,
          resolvedAt: new Date()
        }
      }).catch(() => ({ count: 1 }));

      if (res && res.count === 0 && !this.interventions.has(id)) {
        throw new Error("Intervention already resolved or not found");
      }
    }

    const intervention = this.interventions.get(id);
    if (intervention) {
      intervention.status = "RESOLVED";
      intervention.humanDecision = humanDecision;
    }

    this.emit(`resolved:${id}`, humanDecision);
    return intervention;
  }

  getPendingInterventions() {
    return Array.from(this.interventions.values()).filter(i => i.status === "PENDING");
  }
}
