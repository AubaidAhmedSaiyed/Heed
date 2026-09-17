import { PrismaClient } from "@prisma/client";

export class BehaviorEngine {
  private prisma = new PrismaClient();

  async getProfile(agentId: string) {
    try {
      const allowedEvents = await this.prisma.actionEvent.findMany({
        where: {
          execution: { agentId },
          status: 'EXECUTED' // Only successfully completed external actions or ALLOWED actions
        },
        orderBy: { timestamp: 'asc' }
      });

      const actionFrequency: Record<string, number> = {};
      const transitions: Record<string, number> = {};
      
      let previousOp = null;
      for (const event of allowedEvents) {
        actionFrequency[event.operation] = (actionFrequency[event.operation] || 0) + 1;
        if (previousOp) {
          const key = `${previousOp}->${event.operation}`;
          transitions[key] = (transitions[key] || 0) + 1;
        }
        previousOp = event.operation;
      }

      return { actionFrequency, transitions, total: allowedEvents.length };
    } catch (e) {
      // Fallback if DB fails
      return {
        actionFrequency: { "read_file": 1, "run_tests": 1 },
        transitions: { "read_diff->read_tests": 1 },
        total: 2
      };
    }
  }

  async calculateDeviation(agentId: string, currentAction: string, previousAction?: string): Promise<number> {
    const profile = await this.getProfile(agentId);
    
    let deviation = 0;
    
    const freq = (profile.actionFrequency as any)[currentAction] || 0;
    if (freq === 0 && profile.total > 0) deviation += 20;

    if (previousAction && profile.total > 0) {
      const transitionKey = `${previousAction}->${currentAction}`;
      const transFreq = (profile.transitions as any)[transitionKey] || 0;
      if (transFreq === 0) deviation += 20;
    }

    return deviation;
  }
}
