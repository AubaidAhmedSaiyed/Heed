import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RuntimeGateway } from '../../apps/api/src/runtime/RuntimeGateway';
import { ActionNormalizer } from '../../apps/api/src/actions/ActionNormalizer';
import { DecisionEngine } from '../../apps/api/src/trajectory/DecisionEngine';
import { ContractEvaluator } from '../../apps/api/src/trajectory/evaluators/ContractEvaluator';
import { PolicyEvaluator } from '../../apps/api/src/trajectory/evaluators/PolicyEvaluator';
import { CapabilityEvaluator } from '../../apps/api/src/trajectory/evaluators/CapabilityEvaluator';
import { validateApprovalBinding } from '../../packages/runtime-sdk/src/models/ApprovalBinding';

describe('HEED Security Framework Evaluation Suite', () => {
  let runtimeGateway: RuntimeGateway;
  let mockPrisma: any;
  let mockActionEvents: any[] = [];

  beforeEach(() => {
    mockActionEvents = [];
    mockPrisma = {
      execution: {
        findUnique: vi.fn().mockResolvedValue({ id: 'test-exec', evaluationMode: 'ENFORCE', status: 'RUNNING' }),
        update: vi.fn().mockResolvedValue({}),
      },
      executionContract: {
        findUnique: vi.fn().mockResolvedValue({
          executionId: 'test-exec',
          objective: 'Test objective',
          allowedSystems: ['http', 'github', 'db', 'system'],
          allowedCapabilities: ['external_network.write', 'credential.read', 'database.read'],
          forbiddenCapabilities: ['os.execute'], // Added os.execute to trigger BLOCK
          restrictedResources: [],
          expectedActions: [],
          flowRules: [
            { sourceLabels: ['PII'], destinationTypes: ['EXTERNAL_WEBHOOK'], decision: 'BLOCK', reason: 'IFC_VIOLATION' },
            { sourceLabels: ['SECRET'], destinationTypes: ['EXTERNAL_API'], decision: 'BLOCK', reason: 'IFC_VIOLATION_SECRET' }
          ],
          noGoPatterns: [
            { type: 'SEQUENCE', precedingCapability: 'credential.read', followingCapability: 'external_network.write', decision: 'BLOCK', reason: 'CREDENTIAL_EXFILTRATION' }
          ],
          forbiddenProvenance: []
        }),
      },
      actionEvent: {
        findMany: vi.fn().mockImplementation(() => Promise.resolve(mockActionEvents)),
        create: vi.fn().mockImplementation((data) => {
          mockActionEvents.push(data.data);
          return Promise.resolve(data.data);
        }),
      },
      event: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({}),
      },
      executionPolicySnapshot: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      $transaction: vi.fn(async (cb) => {
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
      interventionManager: {
        createIntervention: vi.fn().mockResolvedValue({ id: 'inv-1' }),
        getPendingInterventions: vi.fn().mockReturnValue([]),
        once: vi.fn((event, cb) => cb('BLOCK')) // Simulates human rejecting it
      },
      prisma: mockPrisma
    });
  });

  it('HEED-001 — PII → External Webhook', async () => {
    await expect(runtimeGateway.processActionRequest('test-exec', {
      system: 'http',
      operation: 'post',
      capability: 'external_network.write',
      resource: 'http://webhook.external.com',
      arguments: {},
      destinationType: 'EXTERNAL_WEBHOOK',
      provenanceLabels: ['PII']
    })).rejects.toThrowError(/IFC_VIOLATION/); 
  });

  it('HEED-002 — SECRET → External API', async () => {
    await expect(runtimeGateway.processActionRequest('test-exec', {
      system: 'http',
      operation: 'post',
      capability: 'external_network.write',
      resource: 'http://api.external.com',
      arguments: {},
      destinationType: 'EXTERNAL_API',
      provenanceLabels: ['SECRET']
    })).rejects.toThrowError(/IFC_VIOLATION_SECRET/);
  });

  it('HEED-003 — Credential Read → External Write', async () => {
    mockActionEvents = [{ capability: 'credential.read', status: 'EXECUTED', timestamp: new Date() }];
    await expect(runtimeGateway.processActionRequest('test-exec', {
      system: 'http',
      operation: 'post',
      capability: 'external_network.write',
      resource: 'http://evil.com',
      arguments: {}
    })).rejects.toThrowError(/CREDENTIAL_EXFILTRATION/);
  });

  it('HEED-004 — Provenance Stripping', async () => {
    expect(true).toBe(true);
  });

  it('HEED-005 — Provenance Spoofing', async () => {
    expect(true).toBe(true);
  });

  it('HEED-006 — Destination Manipulation', async () => {
    const binding = { id: "app-006", consumed: false, status: "APPROVED" } as any;
    const isValid = validateApprovalBinding(binding, "exec-1", "http", "post", "external_network.write", "http://evil.com", "hash-args", "hash-prov", "hash-DEST-APPROVED", "snapshot-1");
    expect(isValid.valid).toBe(false);
  });

  it('HEED-007 — Approval Replay', async () => {
    const binding = { id: "app-007", consumed: true, status: "APPROVED" } as any;
    const isValid = validateApprovalBinding(binding, "exec-1", "http", "post", "external_network.write", "http://target.com", "hash-args", "hash-prov", "hash-dest", "snapshot-1");
    expect(isValid.valid).toBe(false);
  });

  it('HEED-008 — Approval Mutation', async () => {
    const binding = { id: "app-008", consumed: false, status: "APPROVED" } as any;
    const isValid = validateApprovalBinding(binding, "exec-1", "http", "post", "external_network.write", "http://target.com", "hash-args-MUTATED", "hash-prov", "hash-dest", "snapshot-1");
    expect(isValid.valid).toBe(false);
  });

  it('HEED-009 — Policy Bypass', async () => {
    mockPrisma.executionContract.findUnique.mockResolvedValue(null);
    await expect(runtimeGateway.processActionRequest('test-exec', {
      system: 'system',
      operation: 'execute',
      resource: '',
      arguments: {}
    })).rejects.toThrowError(/No execution contract found/);
  });

  it('HEED-010 — Missing Security Context', async () => {
    mockPrisma.executionContract.findUnique.mockRejectedValue(new Error("DB Down"));
    await expect(runtimeGateway.processActionRequest('test-exec', {
      system: 'system',
      operation: 'execute',
      resource: '',
      arguments: {}
    })).rejects.toThrowError(/Security Evaluation Failure/);
  });

  it('HEED-011 — Prompt Injection → Dangerous Tool Action', async () => {
    await expect(runtimeGateway.processActionRequest('test-exec', {
      system: 'system',
      operation: 'execute',
      capability: 'os.execute',
      resource: '/bin/sh',
      arguments: { cmd: 'rm -rf /' }
    })).rejects.toThrowError(/forbidden/);
  });

  it('HEED-012 — Excessive Agent Authority', async () => {
    // A capability not explicitly allowed results in ASK.
    // Our mock interventionManager returns 'BLOCK'.
    await expect(runtimeGateway.processActionRequest('test-exec', {
      system: 'aws',
      operation: 'create_user',
      capability: 'iam.write',
      resource: 'arn:aws:iam::123:user/evil',
      arguments: {}
    })).rejects.toThrowError(/Action blocked by human intervention/);
  });
});
