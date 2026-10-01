import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RuntimeGateway } from '../../apps/api/src/runtime/RuntimeGateway';
import { ActionNormalizer } from '../../apps/api/src/actions/ActionNormalizer';
import { DecisionEngine } from '../../apps/api/src/trajectory/DecisionEngine';
import { ContractEvaluator } from '../../apps/api/src/trajectory/evaluators/ContractEvaluator';
import { PolicyEvaluator } from '../../apps/api/src/trajectory/evaluators/PolicyEvaluator';
import { CapabilityEvaluator } from '../../apps/api/src/trajectory/evaluators/CapabilityEvaluator';
import { validateApprovalBinding } from '../../packages/runtime-sdk/src/models/ApprovalBinding';

describe('Phase 14 & 15: Adversarial & Invariant Tests', () => {
  let runtimeGateway: RuntimeGateway;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      execution: {
        findUnique: vi.fn().mockResolvedValue({ id: 'test-exec', evaluationMode: 'ENFORCE', status: 'RUNNING' }),
        update: vi.fn().mockResolvedValue({}),
      },
      executionContract: {
        findUnique: vi.fn().mockResolvedValue({
          executionId: 'test-exec',
          objective: 'Test objective',
          allowedSystems: ['http', 'github'],
          allowedCapabilities: ['internal_api.read'],
          forbiddenCapabilities: ['external_network.write'],
          restrictedResources: [],
          expectedActions: [],
          flowRules: [],
          noGoPatterns: [],
          forbiddenProvenance: []
        }),
      },
      actionEvent: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({}),
      },
      event: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({}),
      },
      executionPolicySnapshot: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      $transaction: vi.fn(async (cb) => {
        // mock the transaction object
        return cb(mockPrisma);
      })
    };

    const normalizer = new ActionNormalizer();
    const engine = new DecisionEngine();
    engine.register(new ContractEvaluator());
    engine.register(new PolicyEvaluator());
    engine.register(new CapabilityEvaluator());

    runtimeGateway = new RuntimeGateway({
      normalizer,
      trajectoryEngine: engine,
      connectorManager: { execute: vi.fn().mockResolvedValue({}) },
      eventStore: {
        recordActionBlocked: vi.fn(),
        recordActionAllowed: vi.fn(),
        recordActionFlagged: vi.fn(),
        recordActionExecuted: vi.fn(),
      },
      interventionManager: {},
      prisma: mockPrisma
    });
  });

  it('[INVARIANT] Security evaluation failure must FAIL CLOSED', async () => {
    // Force DB failure
    mockPrisma.executionContract.findUnique.mockRejectedValue(new Error("Database disconnected"));

    await expect(runtimeGateway.processActionRequest('test-exec', {
      system: 'http',
      operation: 'get',
      resource: 'http://example.com',
      arguments: {}
    })).rejects.toThrow(/Security Evaluation Failure/);
  });

  it('[BYPASS] Missing execution contract produces BLOCK', async () => {
    mockPrisma.executionContract.findUnique.mockResolvedValue(null);

    await expect(runtimeGateway.processActionRequest('test-exec', {
      system: 'http',
      operation: 'get',
      resource: 'http://example.com',
      arguments: {}
    })).rejects.toThrow(/Fail-closed: No execution contract found/);
  });

  it('[BYPASS] Forbidden capability execution strictly fails', async () => {
    // The contract forbids 'external_network.write'
    await expect(runtimeGateway.processActionRequest('test-exec', {
      system: 'http',
      operation: 'post',
      capability: 'external_network.write',
      resource: 'http://example.com',
      arguments: {}
    })).rejects.toThrow(/\[POLICY_VIOLATION\] Capability 'external_network.write' is strictly forbidden/);
  });

  it('[APPROVAL INTEGRITY] Replay attacks and parameter mutations are rejected', () => {
    const binding = {
      id: "app-123",
      executionId: "exec-1",
      actionEventId: "action-1",
      system: "database",
      operation: "drop",
      capability: "database.destroy",
      resource: "users_table",
      argumentsHash: "hash-args-xyz",
      provenanceHash: "hash-prov-abc",
      destinationHash: "hash-dest-123",
      policySnapshotId: "snapshot-01",
      expiresAt: new Date(Date.now() + 10000).toISOString(),
      consumed: false,
      status: "APPROVED",
      createdAt: new Date().toISOString()
    } as any;

    // Happy path
    expect(validateApprovalBinding(binding, "exec-1", "database", "drop", "database.destroy", "users_table", "hash-args-xyz", "hash-prov-abc", "hash-dest-123", "snapshot-01").valid).toBe(true);

    // Mutation tests
    expect(validateApprovalBinding(binding, "exec-1", "database", "drop", "database.destroy", "users_table", "hash-args-MUTATED", "hash-prov-abc", "hash-dest-123", "snapshot-01").valid).toBe(false);
    expect(validateApprovalBinding(binding, "exec-1", "database", "drop", "database.destroy", "users_table", "hash-args-xyz", "hash-prov-MUTATED", "hash-dest-123", "snapshot-01").valid).toBe(false);
    expect(validateApprovalBinding(binding, "exec-1", "database", "drop", "database.destroy", "users_table", "hash-args-xyz", "hash-prov-abc", "hash-dest-123", "snapshot-DIFFERENT").valid).toBe(false);
    
    // Replay test
    binding.consumed = true;
    expect(validateApprovalBinding(binding, "exec-1", "database", "drop", "database.destroy", "users_table", "hash-args-xyz", "hash-prov-abc", "hash-dest-123", "snapshot-01").valid).toBe(false);
  });
});
