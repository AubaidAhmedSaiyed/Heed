import { PrismaClient } from "@prisma/client";

export class MetricsService {
  constructor(private prisma: PrismaClient) {}

  async getOverview() {
    const executionsCount = await this.prisma.execution.count();
    const actionCount = await this.prisma.actionEvent.count();
    
    const actionEvents = await this.prisma.actionEvent.findMany({
      select: { status: true, impact: true, system: true, capability: true }
    });

    const allowed = actionEvents.filter(a => a.status === "ALLOWED" || a.status === "EXECUTED").length;
    const blocked = actionEvents.filter(a => a.status === "BLOCKED").length;

    const interventionsCount = await this.prisma.intervention.count();

    return {
      executions: executionsCount,
      actions: actionCount,
      allowed,
      blocked,
      interventions: interventionsCount,
      highImpact: actionEvents.filter(a => a.impact === "HIGH").length
    };
  }

  async getAgents() {
    return this.prisma.agent.findMany({
      include: {
        _count: {
          select: { executions: true }
        }
      }
    });
  }

  async getAgentDetail(agentId: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        executions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            _count: {
              select: { actions: true }
            }
          }
        }
      }
    });

    if (!agent) return null;

    const actionEvents = await this.prisma.actionEvent.findMany({
      where: { execution: { agentId } },
      select: { status: true, impact: true, system: true, capability: true, operation: true, resource: true }
    });

    const totalActions = actionEvents.length;
    const allowed = actionEvents.filter(a => a.status === "ALLOWED" || a.status === "EXECUTED").length;
    const blocked = actionEvents.filter(a => a.status === "BLOCKED").length;

    const capabilityUsage: Record<string, number> = {};
    const systemUsage: Record<string, number> = {};
    
    actionEvents.forEach(a => {
      if (a.capability) capabilityUsage[a.capability] = (capabilityUsage[a.capability] || 0) + 1;
      systemUsage[a.system] = (systemUsage[a.system] || 0) + 1;
    });

    const interventions = await this.prisma.intervention.findMany({
      where: { execution: { agentId } },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    return {
      ...agent,
      metrics: {
        totalActions,
        allowed,
        blocked,
        askCount: interventions.length,
        capabilityUsage,
        systemUsage,
        impactDistribution: {
          LOW: actionEvents.filter(a => a.impact === "LOW").length,
          MEDIUM: actionEvents.filter(a => a.impact === "MEDIUM").length,
          HIGH: actionEvents.filter(a => a.impact === "HIGH").length,
        }
      },
      interventions
    };
  }

  async getExecutions() {
    return this.prisma.execution.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        agent: { select: { id: true, name: true } },
        _count: { select: { actions: true, interventions: true } }
      }
    });
  }

  async getBehaviorChanges() {
    // A deterministic metric for behavior change: 
    // Finding executions where an action was blocked due to [CAPABILITY_ESCALATION] or [OBJECTIVE_DEVIATION]
    const decisions = await this.prisma.decision.findMany({
      where: {
        reasons: {
          hasSome: ["[CAPABILITY_ESCALATION]", "[OBJECTIVE_DEVIATION]"]
        }
      },
      include: {
        actionEvent: {
          include: {
            execution: {
              include: {
                agent: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    
    return decisions.map(d => ({
      id: d.id,
      agentId: d.actionEvent.execution.agentId,
      agentName: d.actionEvent.execution.agent.name,
      executionId: d.actionEvent.executionId,
      reasons: d.reasons.filter(r => r.includes("[CAPABILITY_ESCALATION]") || r.includes("[OBJECTIVE_DEVIATION]")),
      capability: d.actionEvent.capability,
      timestamp: d.createdAt
    }));
  }
}
