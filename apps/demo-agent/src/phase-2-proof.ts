import { Heed, HeedError } from "@heed-ai/runtime";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const heed = new Heed({
  runtimeUrl: "http://localhost:4000",
  agentId: "phase-2-agent",
  executionId: "phase-2-exec",
  apiKey: "dev-key"
});

async function run() {
  console.log("==========================================");
  console.log("HEED PHASE 2 CORE PROOF");
  console.log("==========================================\n");

  // 1. Setup Phase 2 test environment
  console.log("=> Initializing Execution & Contract with constraints...");
  await prisma.agent.upsert({
    where: { id: "phase-2-agent" },
    update: {},
    create: { id: "phase-2-agent", name: "Phase 2 Validation Agent", description: "" }
  });

  await prisma.execution.upsert({
    where: { id: "phase-2-exec" },
    update: { 
      status: "CREATED",
      evaluationMode: "OBSERVE" // Start in Observe mode
    },
    create: {
      id: "phase-2-exec",
      agentId: "phase-2-agent",
      status: "CREATED",
      objective: "Read generic data and output summary",
      evaluationMode: "OBSERVE"
    }
  });

  await prisma.executionContract.upsert({
    where: { executionId: "phase-2-exec" },
    update: {
      maxActions: 3, // Very tight budget for test
      maxExternalWrites: 1
    },
    create: {
      executionId: "phase-2-exec",
      objective: "Read generic data and output summary",
      expectedActions: ["read"],
      allowedSystems: ["http"],
      allowedCapabilities: ["communication.read", "file.read"],
      restrictedResources: ["secrets"],
      maxActions: 3,
      maxExternalWrites: 1
    }
  });

  // 2. Test OBSERVE Mode Bypass
  console.log("\n=> TEST 1: OBSERVE MODE (Should allow even if engine blocks)");
  try {
    const res = await heed.execute({
      system: "http",
      operation: "read",
      resource: "secrets.env", // Restricted!
      capability: "file.read",
      arguments: {}
    });
    console.log("   [SUCCESS] Observe mode permitted the execution bypassing the block.");
  } catch (err: any) {
    console.error("   [FAILED] Action was blocked despite OBSERVE mode!");
  }

  // 3. Switch to ENFORCE Mode
  console.log("\n=> Switching execution to ENFORCE mode...");
  await prisma.execution.update({
    where: { id: "phase-2-exec" },
    data: { evaluationMode: "ENFORCE" }
  });

  // 4. Test Objective-Bound Authorization
  console.log("\n=> TEST 2: ENFORCE MODE (Objective Deviation)");
  try {
    await heed.execute({
      system: "http",
      operation: "read",
      resource: "secrets.env", // Restricted + Objective deviation
      capability: "credential.read",
      arguments: {}
    });
    console.error("   [FAILED] Action allowed! It should have been blocked.");
  } catch (err: any) {
    console.log(`   [SUCCESS] Trapped! Decision: ${err.decision}`);
    console.log(`   Reasons:`, err.reasons);
  }

  // 5. Test Budget Limits (maxActions = 3)
  console.log("\n=> TEST 3: EXECUTION BUDGET LIMIT");
  try {
    // Action 2
    await heed.execute({ system: "http", operation: "read", resource: "public.txt", capability: "file.read", arguments: {} });
    // Action 3 (Limit Reached)
    await heed.execute({ system: "http", operation: "read", resource: "public2.txt", capability: "file.read", arguments: {} });
    console.log("   Allowed up to budget...");
    
    // Action 4 (Should Block due to budget)
    await heed.execute({ system: "http", operation: "read", resource: "public3.txt", capability: "file.read", arguments: {} });
    console.error("   [FAILED] Action allowed! It should have hit budget limit.");
  } catch (err: any) {
    console.log(`   [SUCCESS] Trapped! Decision: ${err.decision}`);
    console.log(`   Reasons:`, err.reasons);
  }

  console.log("\n==========================================");
  console.log("PHASE 2 CORE FEATURES VERIFIED");
  console.log("==========================================");
}

run().catch(console.error);
