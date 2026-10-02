import { Action, Decision } from "@heed-ai/runtime";
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

export class EventStore {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private async appendEvent(workspaceId: string, executionId: string, type: string, payload: any, actionEventData?: any) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Get last event under exclusive lock
      const lastEvent = await tx.event.findFirst({
        where: { executionId, execution: { agent: { workspaceId } } },
        orderBy: { timestamp: 'desc' },
        select: { currentEventHash: true }
      });
      
      const previousHash = lastEvent?.currentEventHash || null;
      const payloadStr = JSON.stringify(payload);
      const contentToHash = previousHash ? `${previousHash}:${payloadStr}` : payloadStr;
      const currentHash = createHash("sha256").update(contentToHash).digest("hex");

      let actionEvent;
      // 2. Insert ActionEvent if present
      if (actionEventData) {
        actionEvent = await tx.actionEvent.upsert({
          where: { idempotencyKey: actionEventData.idempotencyKey },
          update: { status: actionEventData.status },
          create: actionEventData
        });
      }

      // 3. Insert Audit Event
      const auditEvent = await tx.event.create({
        data: {
          executionId,
          type,
          payload,
          previousEventHash: previousHash,
          currentEventHash: currentHash
        }
      });
      return { auditEvent, actionEventId: actionEvent?.id };
    });
  }

  async recordActionRequested(workspaceId: string, action: Action) {
    await this.appendEvent(workspaceId, action.executionId!, "ACTION_REQUESTED", action as any);
  }

  async recordActionAllowed(workspaceId: string, action: Action, decision: Decision) {
    const actionEventData = this.buildActionEventData(action, decision, "ALLOWED");
    await this.appendEvent(workspaceId, action.executionId!, "ACTION_ALLOWED", { action, decision }, actionEventData);
  }

  async recordActionBlocked(workspaceId: string, action: Action, decision: Decision) {
    console.log(`[EventStore] Action BLOCKED recorded for ${action.operation}`);
    const actionEventData = this.buildActionEventData(action, decision, "BLOCKED");
    await this.appendEvent(workspaceId, action.executionId!, "ACTION_BLOCKED", { action, decision }, actionEventData);
  }

  async recordActionFlagged(workspaceId: string, action: Action, decision: Decision) {
    console.log(`[EventStore] Action FLAGGED (ASK) recorded for ${action.operation}`);
    const actionEventData = this.buildActionEventData(action, decision, "FLAGGED");
    const result = await this.appendEvent(workspaceId, action.executionId!, "ACTION_FLAGGED", { action, decision }, actionEventData);
    return result.actionEventId;
  }

  async recordActionExecuted(workspaceId: string, action: Action, result: any) {
    await this.appendEvent(workspaceId, action.executionId!, "ACTION_EXECUTED", { action, result });
  }

  private buildActionEventData(action: Action, decision: Decision, status: string) {
    return {
      executionId: action.executionId!,
      system: action.system,
      operation: action.operation,
      capability: action.capability,
      resource: action.resource,
      resourceType: action.resourceType,
      sensitivity: action.sensitivity || "PUBLIC",
      impact: action.impact || "LOW",
      status: status,
      payloadMetadata: action.argumentsMetadata as any,
      
      // Phase 4 additions
      idempotencyKey: (action as any).idempotencyKey,
      provenanceLabels: action.provenance?.labels || [],
      provenanceSource: action.provenance?.source,
      destinationType: action.destination?.type,
      destinationIdentifier: action.destination?.identifier,
      
      decision: {
        create: {
          decision: decision.decision,
          riskScore: decision.riskScore,
          deviationScore: decision.deviationScore,
          reasons: decision.reasons,
          matchedPolicies: decision.matchedPolicies || [],
          constraints: decision.constraints || {},
          approvalRequirements: decision.approvalRequirements || {},
          evidenceMetadata: decision.evidenceMetadata || {}
        }
      }
    };
  }
}
