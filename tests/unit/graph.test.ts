import { expect, test, describe } from 'vitest';
import { ExecutionGraphService } from '../../apps/api/src/graph/ExecutionGraphService';

describe('ExecutionGraphService', () => {
  test('Graph derivation correctly creates nodes, edges, and representations', async () => {
    // Mock Prisma Client
    const mockPrisma = {
      execution: {
        findUnique: async () => ({
          id: 'exec-123',
          agentId: 'agent-1',
          agent: { name: 'Test Agent' },
          objective: 'Test Objective',
          status: 'RUNNING',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      },
      actionEvent: {
        findMany: async () => [
          {
            id: 'evt-1',
            system: 'github',
            operation: 'read_pull_request',
            resource: 'PR-1',
            capability: 'repository.read',
            sensitivity: 'PUBLIC',
            status: 'ALLOWED',
            timestamp: new Date('2026-01-01T10:00:00Z'),
            decision: { reasons: ['allowed by contract'] }
          },
          {
            id: 'evt-2',
            system: 'http',
            operation: 'post',
            resource: '.env', // Secret resource type!
            capability: 'external_network.write',
            sensitivity: 'RESTRICTED',
            status: 'BLOCKED',
            timestamp: new Date('2026-01-01T10:05:00Z'),
            decision: { reasons: ['Objective deviation'] }
          }
        ]
      }
    };

    const service = new ExecutionGraphService(mockPrisma as any);
    const graph = await service.getExecutionGraph('exec-123');

    expect(graph.execution.id).toBe('exec-123');
    expect(graph.nodes.length).toBe(3); // Start node + 2 action nodes
    
    // Test Chronological ordering & node creation
    expect(graph.nodes[0].id).toBe('start');
    expect(graph.nodes[1].id).toBe('action-evt-1');
    expect(graph.nodes[2].id).toBe('action-evt-2');

    // Test edges (start -> evt-1 -> evt-2)
    expect(graph.edges.length).toBe(2);
    expect(graph.edges[0].source).toBe('start');
    expect(graph.edges[0].target).toBe('action-evt-1');
    expect(graph.edges[1].source).toBe('action-evt-1');
    expect(graph.edges[1].target).toBe('action-evt-2');

    // Test ALLOW representation
    expect(graph.nodes[1].data.status).toBe('ALLOWED');
    expect(graph.edges[0].style.stroke).toBe('#10b981'); // Green edge

    // Test BLOCK representation
    expect(graph.nodes[2].data.status).toBe('BLOCKED');
    expect(graph.edges[1].style.stroke).toBe('#ef4444'); // Red edge
    expect(graph.nodes[2].data.decision.reasons).toContain('Objective deviation');

    // Secrets Never Appear in Graph Output
    // Check that we only output the metadata from the actionEvent.
    // Ensure raw arguments are not in the nodes.
    const node2Data = graph.nodes[2].data;
    expect(node2Data).not.toHaveProperty('payloadMetadata'); // We don't expose payload metadata directly in nodes
    expect(node2Data.resource).toBe('.env'); // This is just the name, not contents.
  });
});
