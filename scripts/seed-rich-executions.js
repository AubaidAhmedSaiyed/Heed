const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRichExecutions() {
  console.log('Seeding rich executions and action events into Heed rethen_dev...');

  const agentId = '0bbcb20c-2aa4-4601-9a2f-d8505725ba0b';
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) {
    console.error(`Agent ${agentId} not found!`);
    process.exit(1);
  }

  const policyVersion = await prisma.policyVersion.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  const now = new Date();

  const richScenarios = [
    {
      obj: 'Triage customer #4 (Devin Vance) - Critical Connection Pool Exhaustion',
      status: 'COMPLETED',
      budget: 35,
      consumed: 16,
      trust: 'TRUSTED',
      hoursAgo: 5,
      actions: [
        { sys: 'postgres', op: 'list_open_tickets', cap: 'database.read', res: 'heed_agent_demo/support_tickets', weight: 1, rev: 'REVERSIBLE', decision: 'ALLOW' },
        { sys: 'postgres', op: 'get_ticket', cap: 'database.read', res: 'heed_agent_demo/support_tickets/16', weight: 1, rev: 'REVERSIBLE', decision: 'ALLOW' },
        { sys: 'postgres', op: 'update_ticket_priority', cap: 'database.write', res: 'heed_agent_demo/support_tickets/16', weight: 10, rev: 'REVERSIBLE', decision: 'ALLOW' },
        { sys: 'postgres', op: 'update_ticket_status', cap: 'database.write', res: 'heed_agent_demo/support_tickets/16', weight: 4, rev: 'REVERSIBLE', decision: 'ALLOW' }
      ]
    },
    {
      obj: 'Investigate high-risk refund request #2 (Double Billing $98.00)',
      status: 'TERMINATED',
      budget: 30,
      consumed: 6,
      trust: 'EXTERNAL_DESTINATION',
      hoursAgo: 4,
      actions: [
        { sys: 'postgres', op: 'get_ticket', cap: 'database.read', res: 'heed_agent_demo/support_tickets/2', weight: 1, rev: 'REVERSIBLE', decision: 'ALLOW' },
        { sys: 'database', op: 'query_customer_cards', cap: 'database.read', res: 'billing/cards', weight: 5, rev: 'REVERSIBLE', decision: 'ALLOW', newTrust: 'SENSITIVE_DATA' },
        { sys: 'http', op: 'export_customer_data', cap: 'external_network.write', res: 'https://external-leak-site.xyz/api', weight: 25, rev: 'IRREVERSIBLE', decision: 'BLOCK', block: true, newTrust: 'EXTERNAL_DESTINATION' }
      ]
    },
    {
      obj: 'Autonomous support triage: Update status of Ticket #21 (Driver dispatch iOS crash)',
      status: 'AWAITING_APPROVAL',
      budget: 30,
      consumed: 12,
      trust: 'TRUSTED',
      hoursAgo: 1,
      actions: [
        { sys: 'postgres', op: 'list_open_tickets', cap: 'database.read', res: 'heed_agent_demo/support_tickets', weight: 1, rev: 'REVERSIBLE', decision: 'ALLOW' },
        { sys: 'postgres', op: 'get_ticket', cap: 'database.read', res: 'heed_agent_demo/support_tickets/21', weight: 1, rev: 'REVERSIBLE', decision: 'ALLOW' },
        { sys: 'postgres', op: 'update_ticket_status', cap: 'database.write', res: 'heed_agent_demo/support_tickets/21', weight: 10, rev: 'IRREVERSIBLE', decision: 'ASK', ask: true }
      ]
    },
    {
      obj: 'Remediate Ticket #26: Potential Prompt Injection Payload in Support Form',
      status: 'COMPLETED',
      budget: 40,
      consumed: 15,
      trust: 'UNTRUSTED_INPUT',
      hoursAgo: 3,
      actions: [
        { sys: 'postgres', op: 'get_ticket', cap: 'database.read', res: 'heed_agent_demo/support_tickets/26', weight: 1, rev: 'REVERSIBLE', decision: 'ALLOW', newTrust: 'UNTRUSTED_INPUT' },
        { sys: 'security', op: 'sanitize_input', cap: 'system.verify', res: 'prompt_filter', weight: 4, rev: 'REVERSIBLE', decision: 'ALLOW' },
        { sys: 'postgres', op: 'update_ticket_status', cap: 'database.write', res: 'heed_agent_demo/support_tickets/26', weight: 10, rev: 'REVERSIBLE', decision: 'ALLOW' }
      ]
    },
    {
      obj: 'Automated user data privacy export (Ticket #33: GDPR Right to be Forgotten)',
      status: 'AWAITING_APPROVAL',
      budget: 20,
      consumed: 6,
      trust: 'SENSITIVE_DATA',
      hoursAgo: 2,
      actions: [
        { sys: 'postgres', op: 'get_ticket', cap: 'database.read', res: 'heed_agent_demo/support_tickets/33', weight: 1, rev: 'REVERSIBLE', decision: 'ALLOW' },
        { sys: 'database', op: 'read_telemetry_archives', cap: 'database.read', res: 'telemetry/user_8821', weight: 5, rev: 'REVERSIBLE', decision: 'ALLOW', newTrust: 'SENSITIVE_DATA' },
        { sys: 'database', op: 'purge_historical_records', cap: 'database.write', res: 'telemetry/user_8821', weight: 20, rev: 'IRREVERSIBLE', decision: 'ASK', ask: true }
      ]
    },
    {
      obj: 'Routine hourly support ticket queue sweep and health check',
      status: 'COMPLETED',
      budget: 30,
      consumed: 6,
      trust: 'TRUSTED',
      hoursAgo: 6,
      actions: [
        { sys: 'postgres', op: 'list_open_tickets', cap: 'database.read', res: 'heed_agent_demo/support_tickets', weight: 1, rev: 'REVERSIBLE', decision: 'ALLOW' },
        { sys: 'postgres', op: 'list_customer_tickets', cap: 'database.read', res: 'heed_agent_demo/customers/5', weight: 1, rev: 'REVERSIBLE', decision: 'ALLOW' },
        { sys: 'postgres', op: 'list_customer_tickets', cap: 'database.read', res: 'heed_agent_demo/customers/7', weight: 1, rev: 'REVERSIBLE', decision: 'ALLOW' },
        { sys: 'postgres', op: 'list_customer_tickets', cap: 'database.read', res: 'heed_agent_demo/customers/11', weight: 1, rev: 'REVERSIBLE', decision: 'ALLOW' },
        { sys: 'postgres', op: 'list_customer_tickets', cap: 'database.read', res: 'heed_agent_demo/customers/14', weight: 1, rev: 'REVERSIBLE', decision: 'ALLOW' },
        { sys: 'postgres', op: 'list_customer_tickets', cap: 'database.read', res: 'heed_agent_demo/customers/20', weight: 1, rev: 'REVERSIBLE', decision: 'ALLOW' }
      ]
    }
  ];

  for (const s of richScenarios) {
    const timestamp = new Date(now.getTime() - s.hoursAgo * 3600 * 1000);

    const execution = await prisma.execution.create({
      data: {
        agentId: agent.id,
        objective: s.obj,
        status: s.status,
        impactBudget: s.budget,
        impactConsumed: s.consumed,
        trustState: s.trust,
        createdAt: timestamp,
        updatedAt: timestamp,
        contract: {
          create: {
            objective: s.obj,
            expectedActions: s.actions.map(a => a.op),
            allowedSystems: ['postgres', 'http', 'database', 'security'],
            allowedCapabilities: ['database.read', 'database.write', 'system.verify'],
            restrictedResources: []
          }
        },
        ...(policyVersion ? {
          snapshots: {
            create: {
              policyVersionId: policyVersion.id
            }
          }
        } : {})
      }
    });

    let currentConsumed = 0;
    let currentTrust = 'TRUSTED';

    for (let i = 0; i < s.actions.length; i++) {
      const act = s.actions[i];
      const nextTrust = act.newTrust || currentTrust;
      const actTime = new Date(timestamp.getTime() + i * 45 * 1000);

      const evt = await prisma.actionEvent.create({
        data: {
          executionId: execution.id,
          system: act.sys,
          operation: act.op,
          capability: act.cap,
          resource: act.res,
          sensitivity: nextTrust === 'SENSITIVE_DATA' ? 'RESTRICTED' : 'INTERNAL',
          status: act.block ? 'BLOCKED' : (act.ask ? 'REQUESTED' : 'EXECUTED'),
          timestamp: actTime,
          impactWeight: act.weight,
          reversibility: act.rev,
          impactBefore: currentConsumed,
          impactAfter: currentConsumed + (act.block || act.ask ? 0 : act.weight),
          trustStateBefore: currentTrust,
          trustStateAfter: nextTrust
        }
      });

      await prisma.decision.create({
        data: {
          actionEventId: evt.id,
          decision: act.decision,
          riskScore: act.weight * 3,
          deviationScore: 0,
          reasons: act.block 
            ? ['TRUST_BOUNDARY_CROSSED: EXTERNAL_DESTINATION', 'HIGH_IMPACT_ACTION', 'DATA_EXFILTRATION_PREVENTED'] 
            : (act.ask ? ['BUDGET_EXCEEDED_OR_IRREVERSIBLE', 'HUMAN_APPROVAL_MANDATED'] : ['WITHIN_BOUNDED_BUDGET', 'REVERSIBLE'])
        }
      });

      if (act.ask) {
        await prisma.intervention.create({
          data: {
            executionId: execution.id,
            actionEventId: evt.id,
            status: 'PENDING',
            reason: act.weight > 15 ? 'HIGH_IMPACT_OPERATION_REQUIRING_SUPERVISOR_SIGNOFF' : 'BUDGET_AND_MUTATION_RESTRICTION'
          }
        });
      }

      if (act.block && s.status === 'TERMINATED') {
        const prevEvents = await prisma.actionEvent.findMany({
          where: { executionId: execution.id, reversibility: 'REVERSIBLE' }
        });
        for (const prevEv of prevEvents) {
          await prisma.compensation.create({
            data: {
              executionId: execution.id,
              actionEventId: prevEv.id,
              status: 'SUCCEEDED',
              attemptedAt: actTime,
              completedAt: new Date(actTime.getTime() + 1000)
            }
          });
        }
      }

      currentConsumed += (act.block || act.ask ? 0 : act.weight);
      currentTrust = nextTrust;
    }

    console.log(`✓ Seeded execution: "${s.obj}" (${s.status})`);
  }

  console.log('🎉 Heed rethen_dev enriched with realistic scenarios, interventions, and compensations!');
  process.exit(0);
}

seedRichExecutions().catch(err => {
  console.error(err);
  process.exit(1);
});
