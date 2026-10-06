import { RawActionRequest } from "@heed-ai/runtime";
import { Connector, OperationMetadata } from "./Connector";
import { PrismaClient } from "@prisma/client";

export class PostgreSqlConnector implements Connector {
  name = "postgres";
  capabilities = ["database.read", "database.write"];
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  getOperationMetadata(operation: string, capability?: string): OperationMetadata {
    const op = operation.toLowerCase();

    // Safe read operations: low impact (1), internal sensitivity
    if (op.includes("read") || op.includes("query") || op.includes("get") || op.includes("find") || op.includes("select")) {
      return {
        reversibility: "REVERSIBLE",
        impactWeight: 1,
        dataSensitivity: "INTERNAL",
        trustEffect: "NONE",
        compensationAvailable: false
      };
    }

    // High impact bulk operations: impactWeight 10 -> triggers ASK in ImpactEvaluator
    if (op.includes("bulk") || op.includes("all") || op.includes("batch") || op.includes("resolve_all") || op.includes("truncate") || op.includes("drop")) {
      return {
        reversibility: "REVERSIBLE",
        impactWeight: 10,
        dataSensitivity: "INTERNAL",
        trustEffect: "NONE",
        compensationAvailable: false
      };
    }

    // Single-record safe mutation: impactWeight 3 -> evaluates to ALLOW
    if (op.includes("note") || op.includes("update") || op.includes("edit") || op.includes("write")) {
      return {
        reversibility: "REVERSIBLE",
        impactWeight: 3,
        dataSensitivity: "INTERNAL",
        trustEffect: "NONE",
        compensationAvailable: true
      };
    }

    // Default fallback
    return {
      reversibility: "UNKNOWN",
      impactWeight: 10,
      dataSensitivity: "INTERNAL",
      trustEffect: "NONE",
      compensationAvailable: false
    };
  }

  async execute(action: RawActionRequest): Promise<any> {
    const op = action.operation.toLowerCase();
    const args = action.arguments || {};
    console.log(`[PostgreSqlConnector] Executing real PostgreSQL query for operation: ${action.operation}`);

    // Operation 1: Read tickets
    if (op.includes("read") || op.includes("query") || op.includes("get") || op.includes("find")) {
      const where: any = {};
      if (args.priority) {
        where.priority = Array.isArray(args.priority) ? { in: args.priority } : String(args.priority).toUpperCase();
      }
      if (args.status) {
        where.status = String(args.status).toUpperCase();
      }
      if (args.id || args.ticketId) {
        where.id = parseInt(args.id || args.ticketId, 10);
      }

      const tickets = await this.prisma.supportTicket.findMany({
        where,
        orderBy: { id: "asc" }
      });

      return {
        count: tickets.length,
        tickets
      };
    }

    // Operation 2: Add investigation note / update single ticket
    if (op.includes("note") || (op.includes("update") && !op.includes("bulk") && !op.includes("all"))) {
      const ticketId = parseInt(args.ticketId || args.id || "1", 10);
      const note = args.note || args.internalNotes || args.content || "Investigation initiated by agent";

      const updated = await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          internalNotes: note
        }
      });

      return {
        success: true,
        ticket: updated
      };
    }

    // Operation 3: Bulk resolve all open tickets
    if (op.includes("bulk") || op.includes("all") || op.includes("resolve")) {
      const result = await this.prisma.supportTicket.updateMany({
        where: { status: "OPEN" },
        data: {
          status: "RESOLVED"
        }
      });

      return {
        success: true,
        resolvedCount: result.count
      };
    }

    // Raw SQL execution if specified
    if (args.sql && typeof args.sql === "string") {
      const result = await this.prisma.$queryRawUnsafe(args.sql);
      return result;
    }

    throw new Error(`Unsupported PostgreSQL operation: ${action.operation}`);
  }

  async compensate(action: RawActionRequest): Promise<any> {
    const args = action.arguments || {};
    if (args.ticketId || args.id) {
      const ticketId = parseInt(args.ticketId || args.id, 10);
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { internalNotes: null }
      });
      return { status: "compensated", ticketId };
    }
    return { status: "no_compensation_needed" };
  }
}
