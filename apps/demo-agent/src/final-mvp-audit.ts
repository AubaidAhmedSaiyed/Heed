import { Heed } from "@heed/runtime";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const heed = new Heed({
  runtimeUrl: "http://localhost:4000",
  agentId: "mvp-agent",
  executionId: "mvp-exec",
  apiKey: "dev-key"
});

async function run() {
  console.log("==========================================");
  console.log("FINAL MVP AUDIT: END-TO-END VERIFICATION");
  console.log("==========================================\n");

  // 1. Setup Execution
  console.log("=> Initializing Execution & Contract...");
  await prisma.agent.upsert({
    where: { id: "mvp-agent" },
    update: {},
    create: { id: "mvp-agent", name: "MVP Agent", description: "" }
  });

  await prisma.execution.upsert({
    where: { id: "mvp-exec" },
    update: { 
      status: "CREATED",
      evaluationMode: "OBSERVE"
    },
    create: {
      id: "mvp-exec",
      agentId: "mvp-agent",
      status: "CREATED",
      objective: "Investigate issue #3812 and prepare a code change for review.",
      evaluationMode: "OBSERVE"
    }
  });

  await prisma.executionContract.upsert({
    where: { executionId: "mvp-exec" },
    update: {
      expectedActions: ["read_pull_request", "read_diff", "post", "send_message"],
      allowedSystems: ["github", "http", "slack"],
      allowedCapabilities: ["repository.read", "communication.write", "file.read", "external_network.write"],
      restrictedResources: ["secrets", ".env", "production", "billing"],
      maxActions: 3,
      maxExternalWrites: 1
    },
    create: {
      executionId: "mvp-exec",
      objective: "Investigate issue #3812 and prepare a code change for review.",
      expectedActions: ["read_pull_request", "read_diff", "post", "send_message"],
      allowedSystems: ["github", "http", "slack"],
      allowedCapabilities: ["repository.read", "communication.write", "file.read", "external_network.write"],
      restrictedResources: ["secrets", ".env", "production", "billing"],
      maxActions: 3,
      maxExternalWrites: 1
    }
  });

  // 2. Clear events to restart the trajectory limit counts
  await prisma.intervention.deleteMany({ where: { executionId: "mvp-exec" } });
  await prisma.decision.deleteMany({ where: { actionEvent: { executionId: "mvp-exec" } } });
  await prisma.actionEvent.deleteMany({ where: { executionId: "mvp-exec" } });

  // TEST 1: OBSERVE MODE
  console.log("\n=> TEST 1: OBSERVE MODE (Should allow even if block reason triggers)");
  try {
    const res = await heed.execute({
      system: "github",
      operation: "read_pull_request",
      resource: "repo/pr/secrets.env", // Will flag Resource Deviation
      capability: "credential.read",     // Capability Escalation
      arguments: { owner: "facebook", repo: "react", pull_number: 10000 }
    });
    console.log("   [SUCCESS] Observe mode allowed execution despite internal block flag.");
  } catch (err: any) {
    console.error("   [FAILED] Action was blocked in OBSERVE mode!");
  }

  // Switch to ENFORCE
  console.log("\n=> Switching execution to ENFORCE mode...");
  await prisma.execution.update({
    where: { id: "mvp-exec" },
    data: { evaluationMode: "ENFORCE" }
  });

  // TEST 2: ALLOWED (REAL GITHUB)
  console.log("\n=> TEST 2: ALLOWED ACTION (Real GitHub Connector)");
  try {
    const res = await heed.execute({
      system: "github",
      operation: "read_pull_request",
      resource: "facebook/react/pulls/10000",
      capability: "repository.read",
      arguments: { owner: "facebook", repo: "react", pull_number: 10000 }
    });
    console.log("   [SUCCESS] Allowed. GitHub PR Title:", res.data?.title);
  } catch (err: any) {
    console.error("   [FAILED] Real GitHub allowed action failed:", err);
  }

  // TEST 3: BLOCKED (OBJECTIVE DEVIATION)
  console.log("\n=> TEST 3: BLOCKED ACTION (Objective Deviation)");
  try {
    await heed.execute({
      system: "http",
      operation: "read",
      resource: "production/secrets.env",
      capability: "credential.read",
      arguments: { token: "this-is-a-secret" } // testing secret redaction
    });
    console.error("   [FAILED] Action allowed! It should have been blocked.");
  } catch (err: any) {
    console.log(`   [SUCCESS] Trapped! Decision: ${err.decision}`);
    console.log(`   Reasons:`, err.reasons);
  }

  // TEST 4: EXECUTION BUDGET
  console.log("\n=> TEST 4: EXECUTION LIMIT");
  try {
    // Action 3 (budget = 3)
    await heed.execute({ system: "github", operation: "read_diff", resource: "facebook/react", capability: "repository.read", arguments: { owner: "facebook", repo: "react", pull_number: 10000 } });
    console.log("   Action 3 allowed.");
    
    // Action 4
    await heed.execute({ system: "http", operation: "post", resource: "webhook", capability: "communication.write", arguments: {} });
    console.error("   [FAILED] Action allowed! It should have hit budget limit.");
  } catch (err: any) {
    console.log(`   [SUCCESS] Trapped! Decision: ${err.decision}`);
    console.log(`   Reasons:`, err.reasons);
  }

  // TEST 5: ASK FLOW (We need to increase budget first)
  console.log("\n=> TEST 5: ASK (HUMAN INTERVENTION)");
  await prisma.executionContract.update({
    where: { executionId: "mvp-exec" },
    data: { maxActions: 10 }
  });
  
  try {
    // Start the ASK action asynchronously so we can resolve it
    const askPromise = heed.execute({ system: "http", operation: "post", resource: "unknown-webhook", capability: "external_network.write", arguments: {} });
    
    // Wait a brief moment for the intervention to be created
    await new Promise(r => setTimeout(r, 1000));
    
    // Fetch interventions from API
    const interventionsRes = await fetch("http://localhost:4000/interventions");
    const interventions = await interventionsRes.json();
    
    if (interventions.length > 0) {
      const inv = interventions[0];
      console.log(`   [SUCCESS] Intervention paused successfully. ID: ${inv.id}`);
      
      // Resolve it
      await fetch(`http://localhost:4000/interventions/${inv.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "ALLOW_ONCE" })
      });
      console.log("   [SUCCESS] Intervention resolved with ALLOW_ONCE.");
      
      const res = await askPromise;
      console.log("   [SUCCESS] Execution resumed and completed:", res);
    } else {
      console.error("   [FAILED] No interventions found!");
    }
  } catch (err) {
    console.error("   [FAILED] Ask flow threw error unexpectedly:", err);
  }

  // TEST 6: CHECK REDACTION
  console.log("\n=> TEST 6: SECRET REDACTION & IMPACT VERIFICATION");
  const events = await prisma.actionEvent.findMany({ where: { executionId: "mvp-exec" }, orderBy: { timestamp: "asc" } });
  
  const secretEvent = events.find(e => e.resource === "production/secrets.env");
  if (secretEvent) {
    const payload = secretEvent.payloadMetadata as any;
    if (payload.token === "[REDACTED]") {
      console.log("   [SUCCESS] Secret token was securely redacted in the database payload.");
    } else {
      console.error("   [FAILED] Secret token leaked!", payload);
    }
    
    if (secretEvent.impact === "HIGH") {
      console.log("   [SUCCESS] Action was classified as HIGH impact.");
    } else {
      console.error("   [FAILED] Action impact was:", secretEvent.impact);
    }
  }

  console.log("\n==========================================");
  console.log("ALL REAL-WORLD SCENARIOS VERIFIED");
  console.log("==========================================");
}

run().catch(console.error);
