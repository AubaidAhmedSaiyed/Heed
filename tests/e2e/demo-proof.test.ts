import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { ActionNormalizer } from '../../apps/api/src/actions/ActionNormalizer';
import { DecisionEngine } from '../../apps/api/src/trajectory/DecisionEngine';
import { ContractEvaluator } from '../../apps/api/src/trajectory/evaluators/ContractEvaluator';
import { PolicyEvaluator } from '../../apps/api/src/trajectory/evaluators/PolicyEvaluator';
import { SensitivityEvaluator } from '../../apps/api/src/trajectory/evaluators/SensitivityEvaluator';
import { SequenceEvaluator } from '../../apps/api/src/trajectory/evaluators/SequenceEvaluator';
import { CapabilityEvaluator } from '../../apps/api/src/trajectory/evaluators/CapabilityEvaluator';
import { TrajectoryEvaluator } from '../../apps/api/src/trajectory/evaluators/TrajectoryEvaluator';
import { ConnectorManager } from '../../packages/connectors/src/ConnectorManager';
import { PostgreSqlConnector } from '../../packages/connectors/src/PostgreSqlConnector';
import { HttpSimulator } from '../../packages/connectors/src/HttpSimulator';
import { EventStore } from '../../apps/api/src/events/EventStore';
import { InterventionManager } from '../../apps/api/src/interventions/InterventionManager';
import { RuntimeGateway } from '../../apps/api/src/runtime/RuntimeGateway';
import { validateApprovalBinding } from '../../packages/runtime-sdk/src/models/ApprovalBinding';

describe('E2E Real PostgreSQL Product Demo Proof', () => {
  let prisma: PrismaClient;
  let gateway: RuntimeGateway;
  let interventionManager: InterventionManager;

  beforeAll(async () => {
    prisma = new PrismaClient();

    // Ensure Workspace and Agent
    await prisma.workspace.upsert({
      where: { id: 'default-workspace' },
      update: {},
      create: { id: 'default-workspace', name: 'HEED Demo Workspace' }
    });

    await prisma.agent.upsert({
      where: { id: 'support-agent' },
      update: {},
      create: {
        id: 'support-agent',
        name: 'support-agent',
        description: 'Autonomous Support Agent',
        workspaceId: 'default-workspace'
      }
    });

    // Reset Tickets Deterministically
    await prisma.supportTicket.deleteMany({});
    try {
      await prisma.$executeRawUnsafe(`ALTER SEQUENCE "SupportTicket_id_seq" RESTART WITH 1;`);
    } catch (e) {}

    await prisma.supportTicket.createMany({
      data: [
        { id: 1, title: 'Login Issue', description: 'SSO failure', priority: 'HIGH', status: 'OPEN' },
        { id: 2, title: 'Billing Error', description: 'Double charge', priority: 'CRITICAL', status: 'OPEN' },
        { id: 3, title: 'Feature Request', description: 'Dark mode', priority: 'LOW', status: 'RESOLVED' },
        { id: 4, title: 'Bug in dashboard', description: 'Filter bug', priority: 'MEDIUM', status: 'IN_PROGRESS' }
      ]
    });

    const normalizer = new ActionNormalizer();
    const trajectoryEngine = new DecisionEngine();
    trajectoryEngine.register(new ContractEvaluator());
    trajectoryEngine.register(new PolicyEvaluator());
    trajectoryEngine.register(new SensitivityEvaluator());
    trajectoryEngine.register(new SequenceEvaluator());
    trajectoryEngine.register(new CapabilityEvaluator());
    trajectoryEngine.register(new TrajectoryEvaluator());

    const connectorManager = new ConnectorManager();
    connectorManager.register(new PostgreSqlConnector(prisma));
    connectorManager.register(new HttpSimulator());

    const eventStore = new EventStore(prisma);
    interventionManager = new InterventionManager(prisma);

    gateway = new RuntimeGateway({
      normalizer,
      trajectoryEngine,
      connectorManager,
      eventStore,
      interventionManager,
      prisma
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function createContract(executionId: string, objective: string, overrides: any = {}) {
    await prisma.execution.create({
      data: {
        id: executionId,
        agentId: 'support-agent',
        objective,
        status: 'RUNNING'
      }
    });

    await prisma.executionContract.create({
      data: {
        executionId,
        objective,
        allowedSystems: overrides.allowedSystems || ['postgres', 'postgresql', 'database', 'http'],
        allowedCapabilities: overrides.allowedCapabilities || ['database.read', 'database.write', 'external_network.write'],
        restrictedResources: overrides.restrictedResources || [],
        expectedActions: overrides.expectedActions || ['read_tickets', 'add_note', 'bulk_resolve', 'query'],
        forbiddenCapabilities: overrides.forbiddenCapabilities || ['os.execute'],
        flowRules: overrides.flowRules || []
      }
    });
  }

  it('Scenario A: Safe Read ALLOWs and returns real PostgreSQL records', async () => {
    const execId = `test-e2e-a-${Date.now()}`;
    await createContract(execId, 'Read open high-priority tickets');

    const result = await gateway.processActionRequest('default-workspace', execId, {
      system: 'postgres',
      operation: 'read_tickets',
      resource: 'support_tickets',
      capability: 'database.read',
      arguments: { priority: ['HIGH', 'CRITICAL'], status: 'OPEN' }
    });

    expect(result.count).toBe(2);
    expect(result.tickets.some((t: any) => t.title === 'Login Issue')).toBe(true);
    expect(result.tickets.some((t: any) => t.title === 'Billing Error')).toBe(true);
  });

  it('Scenario B: Safe Modification ALLOWs and actually mutates PostgreSQL', async () => {
    const execId = `test-e2e-b-${Date.now()}`;
    await createContract(execId, 'Add investigation note');

    const note = 'Investigated: OAuth session timeout in cluster.';
    const result = await gateway.processActionRequest('default-workspace', execId, {
      system: 'postgres',
      operation: 'add_note',
      resource: 'support_tickets/1',
      capability: 'database.write',
      arguments: { ticketId: 1, note }
    });

    expect(result.success).toBe(true);

    // Verify in DB directly
    const ticket = await prisma.supportTicket.findUnique({ where: { id: 1 } });
    expect(ticket?.internalNotes).toBe(note);
  });

  it('Scenario C & D: High-Impact Action evaluates to ASK, human DENIAL leaves DB unchanged', async () => {
    const execId = `test-e2e-cd-${Date.now()}`;
    await createContract(execId, 'Bulk resolve open tickets');

    const actionPromise = gateway.processActionRequest('default-workspace', execId, {
      system: 'postgres',
      operation: 'bulk_resolve',
      resource: 'support_tickets',
      capability: 'database.write',
      arguments: { status: 'RESOLVED' }
    });

    await new Promise(r => setTimeout(r, 60));

    // Must be paused
    const exec = await prisma.execution.findUnique({ where: { id: execId } });
    expect(exec?.status).toBe('AWAITING_APPROVAL');

    // DB must still have 2 OPEN tickets
    const openBefore = await prisma.supportTicket.findMany({ where: { status: 'OPEN' } });
    expect(openBefore.length).toBe(2);

    // Operator DENIES
    const interventions = interventionManager.getPendingInterventions();
    expect(interventions.length).toBeGreaterThan(0);
    await interventionManager.resolveIntervention(interventions[0].id, 'BLOCK');

    await expect(actionPromise).rejects.toThrowError(/human intervention|Action blocked/);

    // DB must STILL have 2 OPEN tickets
    const openAfter = await prisma.supportTicket.findMany({ where: { status: 'OPEN' } });
    expect(openAfter.length).toBe(2);
  });

  it('Scenario E: Human Approval (ALLOW_ONCE) resumes execution and mutates PostgreSQL', async () => {
    const execId = `test-e2e-e-${Date.now()}`;
    await createContract(execId, 'Bulk resolve open tickets authorized');

    const actionPromise = gateway.processActionRequest('default-workspace', execId, {
      system: 'postgres',
      operation: 'bulk_resolve',
      resource: 'support_tickets',
      capability: 'database.write',
      arguments: { status: 'RESOLVED' }
    });

    await new Promise(r => setTimeout(r, 60));

    const interventions = interventionManager.getPendingInterventions();
    expect(interventions.length).toBeGreaterThan(0);
    await interventionManager.resolveIntervention(interventions[0].id, 'ALLOW_ONCE');

    const result = await actionPromise;
    expect(result.success).toBe(true);

    // DB must now have 0 OPEN tickets
    const openAfter = await prisma.supportTicket.findMany({ where: { status: 'OPEN' } });
    expect(openAfter.length).toBe(0);
  });

  it('Scenario F: Cryptographic approval tampering and replay are rejected', () => {
    const binding = {
      id: 'bind-1',
      consumed: true,
      status: 'APPROVED',
      argumentsHash: 'hash-original'
    } as any;

    const replay = validateApprovalBinding(binding, 'ex', 'postgres', 'op', 'cap', 'res', 'hash-original', 'p', 'd', 's');
    expect(replay.valid).toBe(false);

    const fresh = { ...binding, consumed: false };
    const tampered = validateApprovalBinding(fresh, 'ex', 'postgres', 'op', 'cap', 'res', 'hash-mutated', 'p', 'd', 's');
    expect(tampered.valid).toBe(false);
  });
});
