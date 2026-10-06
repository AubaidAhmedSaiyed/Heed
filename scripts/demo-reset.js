require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDemo() {
  console.log('====================================================');
  console.log(' [HEED] Deterministic Demo Seed & Reset Mechanism');
  console.log('====================================================');

  // 1. Ensure Default Workspace exists
  const workspace = await prisma.workspace.upsert({
    where: { id: 'default-workspace' },
    update: { name: 'HEED Demo Workspace' },
    create: {
      id: 'default-workspace',
      name: 'HEED Demo Workspace'
    }
  });
  console.log(`✓ Workspace verified: ${workspace.id} ("${workspace.name}")`);

  // 2. Ensure Demo User & Membership exists
  const demoEmail = 'operator@heed.dev';
  const passwordHash = '$2b$10$PhhJ1EPpjTKlVoINIDRcDu9EnPPRvt0137GfC4QSwlUEIKJMs5A0W'; // password123
  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: { name: 'HEED Operator', passwordHash },
    create: {
      email: demoEmail,
      name: 'HEED Operator',
      passwordHash
    }
  });

  await prisma.workspaceMembership.upsert({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspace.id
      }
    },
    update: { role: 'ADMIN' },
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      role: 'ADMIN'
    }
  });
  console.log(`✓ Demo Operator user verified: ${user.email}`);

  // 3. Ensure Demo Agent exists
  const agent = await prisma.agent.upsert({
    where: { id: 'support-agent' },
    update: { name: 'support-agent', description: 'Autonomous Support Resolution Agent' },
    create: {
      id: 'support-agent',
      name: 'support-agent',
      description: 'Autonomous Support Resolution Agent',
      workspaceId: workspace.id
    }
  });
  console.log(`✓ Demo Agent verified: ${agent.id} ("${agent.description}")`);

  // 4. Deterministic Support Tickets Seeding in PostgreSQL
  console.log('✓ Resetting SupportTicket records in PostgreSQL...');
  await prisma.supportTicket.deleteMany({});

  // Reset auto-increment sequence if supported
  try {
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "SupportTicket_id_seq" RESTART WITH 1;`);
  } catch (seqErr) {
    // Some setups or mock engines might not use sequences; ignore if fails
  }

  const seededTickets = [
    {
      id: 1,
      title: 'Login Issue',
      description: 'Customer cannot log in to their dashboard via SSO/OAuth.',
      priority: 'HIGH',
      status: 'OPEN',
      customerEmail: 'sarah.connor@cyberdyne.org',
      internalNotes: null
    },
    {
      id: 2,
      title: 'Billing Error',
      description: 'Charged twice for annual enterprise subscription plan tier.',
      priority: 'CRITICAL',
      status: 'OPEN',
      customerEmail: 'finance@acme-corp.com',
      internalNotes: null
    },
    {
      id: 3,
      title: 'Feature Request',
      description: 'Request for audit export to CSV/JSON format.',
      priority: 'LOW',
      status: 'RESOLVED',
      customerEmail: 'compliance@globex.io',
      internalNotes: 'Implemented in release v2.4'
    },
    {
      id: 4,
      title: 'Bug in dashboard',
      description: 'Analytics chart does not refresh when changing date range picker.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      customerEmail: 'mark.watney@ares.space',
      internalNotes: 'Assigned to frontend triage team'
    }
  ];

  for (const t of seededTickets) {
    await prisma.supportTicket.create({ data: t });
  }

  const currentTickets = await prisma.supportTicket.findMany({ orderBy: { id: 'asc' } });
  console.log(`✓ Successfully seeded ${currentTickets.length} SupportTicket records in PostgreSQL:`);
  for (const t of currentTickets) {
    console.log(`   [#${t.id}] ${t.priority.padEnd(8)} | ${t.status.padEnd(11)} | "${t.title}" | notes: ${t.internalNotes ? `"${t.internalNotes}"` : 'null'}`);
  }

  // 5. Clean up dangling executions for demo-agent to ensure clean demo runs
  const demoExecutions = await prisma.execution.findMany({
    where: { agentId: 'support-agent' },
    select: { id: true }
  });

  if (demoExecutions.length > 0) {
    const execIds = demoExecutions.map(e => e.id);
    await prisma.compensation.deleteMany({ where: { executionId: { in: execIds } } }).catch(() => {});
    await prisma.intervention.deleteMany({ where: { executionId: { in: execIds } } }).catch(() => {});
    await prisma.event.deleteMany({ where: { executionId: { in: execIds } } }).catch(() => {});
    await prisma.actionEvent.deleteMany({ where: { executionId: { in: execIds } } }).catch(() => {});
    await prisma.executionContract.deleteMany({ where: { executionId: { in: execIds } } }).catch(() => {});
    await prisma.executionPolicySnapshot.deleteMany({ where: { executionId: { in: execIds } } }).catch(() => {});
    await prisma.execution.deleteMany({ where: { id: { in: execIds } } }).catch(() => {});
    console.log(`✓ Cleaned up ${demoExecutions.length} previous demo executions.`);
  }

  console.log('====================================================');
  console.log(' [HEED] Deterministic Demo State is Ready!');
  console.log('====================================================\n');
}

resetDemo()
  .catch((err) => {
    console.error('[demo:reset] Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
