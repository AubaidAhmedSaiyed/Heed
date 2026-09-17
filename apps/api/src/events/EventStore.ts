import { Action, Decision } from "@heed/runtime";
import { PrismaClient } from "@prisma/client";

export class EventStore {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async recordActionRequested(action: Action) {
    try {
      return await this.prisma.event.create({
        data: {
          executionId: action.executionId!,
          type: "ACTION_REQUESTED",
          payload: action as any
        }
      });
    } catch (e) {
      // ignore for MVP if no DB
    }
  }

  async recordActionAllowed(action: Action, decision: Decision) {
    try {
      return await this.prisma.event.create({
        data: {
          executionId: action.executionId!,
          type: "ACTION_ALLOWED",
          payload: { action, decision } as any
        }
      });
    } catch (e) {
      // ignore for MVP if no DB
    }
  }

  async recordActionBlocked(action: Action, decision: Decision) {
    console.log(`[EventStore] Action BLOCKED recorded for ${action.operation}`);
    try {
      await this.prisma.actionEvent.create({
        data: {
          executionId: action.executionId!,
          system: action.system,
          operation: action.operation,
          capability: action.capability,
          resource: action.resource,
          resourceType: action.resourceType,
          sensitivity: action.sensitivity || "PUBLIC",
          status: "BLOCKED",
          payloadMetadata: { objective: "Fallback objective", sequenceNumber: action.sequenceNumber },
          decision: {
            create: {
              decision: decision.decision,
              riskScore: decision.riskScore,
              deviationScore: decision.deviationScore,
              reasons: decision.reasons
            }
          }
        }
      });
    } catch (e) { /* ignore */ }
  }

  async recordActionFlagged(action: Action, decision: Decision) {
    console.log(`[EventStore] Action FLAGGED (ASK) recorded for ${action.operation}`);
    try {
      await this.prisma.actionEvent.create({
        data: {
          executionId: action.executionId!,
          system: action.system,
          operation: action.operation,
          capability: action.capability,
          resource: action.resource,
          resourceType: action.resourceType,
          sensitivity: action.sensitivity || "PUBLIC",
          status: "FLAGGED",
          decision: {
            create: {
              decision: decision.decision,
              riskScore: decision.riskScore,
              deviationScore: decision.deviationScore,
              reasons: decision.reasons
            }
          }
        }
      });
    } catch (e) { /* ignore */ }
  }

  async recordActionExecuted(action: Action, result: any) {
    try {
      return await this.prisma.event.create({
        data: {
          executionId: action.executionId!,
          type: "ACTION_EXECUTED",
          payload: { action, result } as any
        }
      });
    } catch (e) {
      // ignore for MVP if no DB
    }
  }
}
