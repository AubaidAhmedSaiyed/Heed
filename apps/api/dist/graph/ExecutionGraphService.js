"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionGraphService = void 0;
class ExecutionGraphService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getExecutionGraph(executionId) {
        const execution = await this.prisma.execution.findUnique({
            where: { id: executionId },
            include: {
                agent: true,
                contract: true,
            }
        });
        if (!execution) {
            throw new Error("Execution not found");
        }
        const events = await this.prisma.actionEvent.findMany({
            where: { executionId },
            orderBy: { timestamp: 'asc' },
            include: {
                decision: true,
                intervention: true
            }
        });
        const nodes = [];
        const edges = [];
        let yPos = 0;
        // Node 0: Objective / Start
        nodes.push({
            id: "start",
            type: "objectiveNode",
            position: { x: 250, y: yPos },
            data: {
                label: "Objective",
                objective: execution.objective,
                agent: execution.agent.name
            }
        });
        let prevNodeId = "start";
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            yPos += 150;
            const nodeId = `action-${event.id}`;
            nodes.push({
                id: nodeId,
                type: "actionNode",
                position: { x: 250, y: yPos },
                data: {
                    label: `${event.system}.${event.operation}`,
                    system: event.system,
                    operation: event.operation,
                    resource: event.resource,
                    capability: event.capability,
                    sensitivity: event.sensitivity,
                    status: event.status,
                    decision: event.decision,
                    intervention: event.intervention,
                    timestamp: event.timestamp
                }
            });
            edges.push({
                id: `e-${prevNodeId}-${nodeId}`,
                source: prevNodeId,
                target: nodeId,
                animated: true,
                style: { stroke: event.status === 'BLOCKED' ? '#ef4444' : '#10b981' }
            });
            prevNodeId = nodeId;
        }
        return {
            execution: {
                id: execution.id,
                agentId: execution.agentId,
                agentName: execution.agent.name,
                objective: execution.objective,
                status: execution.status,
                evaluationMode: execution.evaluationMode,
                createdAt: execution.createdAt,
                updatedAt: execution.updatedAt
            },
            nodes,
            edges,
            timeline: events // the raw chronological events list
        };
    }
}
exports.ExecutionGraphService = ExecutionGraphService;
