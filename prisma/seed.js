const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function main() {
  console.log("Cleaning database...");
  await prisma.compensation.deleteMany({});
  await prisma.intervention.deleteMany({});
  await prisma.decision.deleteMany({});
  await prisma.actionEvent.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.executionContract.deleteMany({});
  await prisma.executionPolicySnapshot.deleteMany({});
  await prisma.execution.deleteMany({});
  await prisma.policyVersion.deleteMany({});
  await prisma.policy.deleteMany({});
  await prisma.agent.deleteMany({});
  await prisma.apiKey.deleteMany({});
  await prisma.workspaceMembership.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.workspace.deleteMany({});

  console.log("Seeding base entities...");
  const user = await prisma.user.create({
    data: {
      email: "demo@heed.ai",
      passwordHash: "hash",
      name: "Demo User"
    }
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "Acme Corp",
      memberships: {
        create: {
          userId: user.id,
          role: "ADMIN"
        }
      }
    }
  });

  // Specifically named agent for the user
  const agent = await prisma.agent.create({
    data: {
      id: "0bbcb20c-2aa4-4601-9a2f-d8505725ba0b",
      name: "Ollama Autonomous Reviewer",
      description: "Code review and deployment agent",
      workspaceId: workspace.id
    }
  });

  await prisma.apiKey.create({
    data: {
      name: "Production Key",
      keyHash: "ae5e12459eafc1efbacd297ce023e00159f6fada5ce3c31f",
      workspaceId: workspace.id
    }
  });

  console.log("Seeding impact-aware policy...");
  const policy = await prisma.policy.create({
    data: {
      name: "Global Autonomous Constraints",
      description: "Main governance policy",
      workspaceId: workspace.id,
      versions: {
        create: {
          version: 1,
          status: "PUBLISHED",
          priority: 100,
          policyHash: crypto.randomBytes(16).toString('hex'),
          defaultExecutionBudget: 50,
          forbiddenCapabilities: ["dangerous.eval"],
          boundApprovalCapabilities: ["repository.write"]
        }
      }
    },
    include: { versions: true }
  });
  const policyVersion = policy.versions[0];

  console.log("Seeding Ollama Executions...");
  const executionsData = [
    {
      obj: "Review frontend PR and suggest changes",
      status: "COMPLETED",
      budget: 30,
      consumed: 12,
      trust: "TRUSTED",
      actions: [
        { sys: "github", op: "read_pull_request", cap: "repo.read", res: "PR-102", weight: 1, rev: "REVERSIBLE" },
        { sys: "github", op: "read_file", cap: "repo.read", res: "src/App.tsx", weight: 1, rev: "REVERSIBLE" },
        { sys: "github", op: "create_comment", cap: "repo.write", res: "PR-102", weight: 10, rev: "REVERSIBLE" }
      ]
    },
    {
      obj: "Investigate and fix memory leak in backend",
      status: "AWAITING_APPROVAL",
      budget: 20,
      consumed: 20,
      trust: "TRUSTED",
      actions: [
        { sys: "github", op: "read_repository", cap: "repo.read", res: "backend", weight: 1, rev: "REVERSIBLE" },
        { sys: "fs-sim", op: "read_file", cap: "file.read", res: "server.ts", weight: 1, rev: "REVERSIBLE" },
        { sys: "fs-sim", op: "edit_file", cap: "file.write", res: "server.ts", weight: 3, rev: "REVERSIBLE" },
        { sys: "fs-sim", op: "run_tests", cap: "tests.run", res: "tests", weight: 1, rev: "REVERSIBLE" },
        { sys: "github", op: "commit", cap: "repo.write", res: "backend", weight: 10, rev: "REVERSIBLE" },
        { sys: "github", op: "merge", cap: "repo.write", res: "PR-204", weight: 10, rev: "IRREVERSIBLE", ask: true }
      ]
    },
    {
      obj: "Fetch customer data and generate report",
      status: "TERMINATED",
      budget: 30,
      consumed: 5,
      trust: "EXTERNAL_DESTINATION",
      actions: [
        { sys: "database", op: "query", cap: "db.read", res: "users_table", weight: 5, rev: "REVERSIBLE", newTrust: "SENSITIVE_DATA" },
        { sys: "http-sim", op: "export_data", cap: "network.write", res: "https://external-api.com", weight: 25, rev: "IRREVERSIBLE", newTrust: "EXTERNAL_DESTINATION", block: true }
      ]
    }
  ];

  for (let i = 0; i < executionsData.length; i++) {
    const exData = executionsData[i];
    
    // Create old timestamp so it looks like history
    const date = new Date();
    date.setHours(date.getHours() - (executionsData.length - i));

    const ex = await prisma.execution.create({
      data: {
        agentId: agent.id,
        objective: exData.obj,
        status: exData.status,
        impactBudget: exData.budget,
        impactConsumed: exData.consumed,
        trustState: exData.trust,
        createdAt: date,
        updatedAt: date,
        contract: {
          create: {
            objective: exData.obj,
            expectedActions: [],
            allowedSystems: [],
            allowedCapabilities: [],
            restrictedResources: []
          }
        },
        snapshots: {
          create: {
            policyVersionId: policyVersion.id
          }
        }
      }
    });

    let currentConsumed = 0;
    let currentTrust = "TRUSTED";

    for (let j = 0; j < exData.actions.length; j++) {
      const act = exData.actions[j];
      const nextTrust = act.newTrust || currentTrust;
      
      const evt = await prisma.actionEvent.create({
        data: {
          executionId: ex.id,
          system: act.sys,
          operation: act.op,
          capability: act.cap,
          resource: act.res,
          sensitivity: nextTrust === "SENSITIVE_DATA" ? "RESTRICTED" : "INTERNAL",
          status: act.block ? "BLOCKED" : (act.ask ? "REQUESTED" : "EXECUTED"),
          timestamp: new Date(date.getTime() + (j * 1000 * 60)), // +1 min apart
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
          decision: act.block ? "BLOCK" : (act.ask ? "ASK" : "ALLOW"),
          riskScore: act.weight * 4,
          deviationScore: 0,
          reasons: act.block ? ["TRUST_BOUNDARY_CROSSED: EXTERNAL_DESTINATION", "HIGH_IMPACT_ACTION"] : (act.ask ? ["BUDGET_EXCEEDED", "IRREVERSIBLE_ACTION"] : ["LOW_IMPACT", "REVERSIBLE"]),
        }
      });

      if (act.ask) {
        await prisma.intervention.create({
          data: {
            executionId: ex.id,
            actionEventId: evt.id,
            status: "PENDING",
            reason: "BUDGET_EXCEEDED"
          }
        });
      }

      if (act.block && exData.status === "TERMINATED") {
        // Roll back previous actions
        for (let k = j - 1; k >= 0; k--) {
          const prev = exData.actions[k];
          if (prev.rev === "REVERSIBLE") {
            // Find the prev event ID (hacky but works for seed)
            const prevEvt = await prisma.actionEvent.findFirst({ where: { executionId: ex.id, operation: prev.op }});
            if (prevEvt) {
              await prisma.compensation.create({
                data: {
                  executionId: ex.id,
                  actionEventId: prevEvt.id,
                  status: "SUCCEEDED",
                  attemptedAt: new Date(),
                  completedAt: new Date()
                }
              });
            }
          }
        }
      }

      currentConsumed += (act.block || act.ask ? 0 : act.weight);
      currentTrust = nextTrust;
    }
  }

  // Add a bunch of successful lightweight executions to fill the dashboard
  for(let i=0; i<8; i++) {
    const ex = await prisma.execution.create({
      data: {
        agentId: agent.id,
        objective: "Routine code review",
        status: "COMPLETED",
        impactBudget: 30,
        impactConsumed: 5,
        trustState: "TRUSTED",
        contract: {
          create: {
            objective: "Routine code review",
            expectedActions: [], allowedSystems: [], allowedCapabilities: [], restrictedResources: []
          }
        }
      }
    });
    const evt = await prisma.actionEvent.create({
      data: {
        executionId: ex.id,
        system: "github", operation: "read_pull_request", capability: "repo.read", resource: "PR-"+(300+i),
        sensitivity: "INTERNAL", status: "EXECUTED", impactWeight: 1, reversibility: "REVERSIBLE",
        impactBefore: 0, impactAfter: 1, trustStateBefore: "TRUSTED", trustStateAfter: "TRUSTED"
      }
    });
    await prisma.decision.create({ data: { actionEventId: evt.id, decision: "ALLOW", riskScore: 0, deviationScore: 0, reasons: [] }});
  }

  console.log("Database seeded with valuable Ollama agent data!");
}

main().catch(console.error);
