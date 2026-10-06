import { Heed } from "@heed-ai/runtime";

const runtimeUrl = process.env.HEED_RUNTIME_URL || "http://localhost:4000";
const apiKey = process.env.HEED_API_KEY || "dev-key";

const agentId = process.env.HEED_AGENT_ID || "support-agent";

const heed = new Heed({
  agentId,
  runtimeUrl,
  apiKey
});

async function runDemoSupportAgent() {
  console.log("========================================================================");
  console.log("  HEED DEMO AGENT: Autonomous Support Triage & Resolution Agent");
  console.log("  Core Thesis: The agent is autonomous, but its authority is not unlimited.");
  console.log("========================================================================\n");

  console.log(`[Agent] Connecting to HEED at: ${runtimeUrl}`);
  try {
    const seedRes = await fetch(`${runtimeUrl}/api/v1/demo/seed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      }
    });
    if (seedRes.ok) {
      console.log(`[Agent] Support tickets seeded cleanly in database.`);
    }
  } catch (e) {
    // Local offline fallback
  }

  console.log("[Agent] Registering execution contract with HEED Runtime...");
  const execId = await heed.createExecution("Triage open high-priority support tickets and remediate issues", {
    objective: "Triage open high-priority support tickets and remediate issues",
    allowedSystems: ["postgres", "postgresql", "database", "http"],
    allowedCapabilities: ["database.read", "database.write", "external_network.write"],
    expectedActions: ["read_tickets", "add_note", "bulk_resolve", "query"]
  });
  heed.setExecutionId(execId);
  console.log(`[Agent] Execution initialized: ${execId}\n`);

  // -------------------------------------------------------------------------
  // STEP 1: Safe Database Read (ALLOW)
  // -------------------------------------------------------------------------
  console.log("[Agent Action 1] Finding all open HIGH and CRITICAL priority support tickets...");
  try {
    const readResult = await heed.execute({
      system: "postgres",
      operation: "read_tickets",
      resource: "support_tickets",
      capability: "database.read",
      arguments: { priority: ["HIGH", "CRITICAL"], status: "OPEN" }
    });
    console.log(`[HEED Runtime] Decision: ALLOW -> PostgreSQL queried successfully.`);
    console.log(`[Agent] Found ${readResult.count} matching open tickets:`);
    for (const t of readResult.tickets) {
      console.log(`   - [#${t.id}] ${t.priority.padEnd(8)} | "${t.title}" (Customer: ${t.customerEmail || "N/A"})`);
    }
  } catch (err: any) {
    console.error(`[Agent Action 1 Failed]:`, err.message);
  }

  // -------------------------------------------------------------------------
  // STEP 2: Safe Database Modification (ALLOW)
  // -------------------------------------------------------------------------
  console.log("\n[Agent Action 2] Investigating ticket 1 and appending internal triage notes...");
  try {
    const noteText = "Agent investigation: OAuth token expiry validated. Redis session re-authenticated.";
    const updateResult = await heed.execute({
      system: "postgres",
      operation: "add_note",
      resource: "support_tickets/1",
      capability: "database.write",
      arguments: { ticketId: 1, note: noteText }
    });
    console.log(`[HEED Runtime] Decision: ALLOW -> Real PostgreSQL UPDATE executed.`);
    console.log(`[Agent] Ticket 1 updated: "${updateResult.ticket.internalNotes}"`);
  } catch (err: any) {
    console.error(`[Agent Action 2 Failed]:`, err.message);
  }

  // -------------------------------------------------------------------------
  // STEP 3: High-Impact Bulk Mutation (ASK)
  // -------------------------------------------------------------------------
  console.log("\n[Agent Action 3] Attempting bulk resolution of ALL open support tickets...");
  console.log("[Notice] This action has high blast radius (impactWeight = 10).");
  console.log("[HEED Runtime] Evaluating impact and authority boundary...");
  
  try {
    const bulkResult = await heed.execute({
      system: "postgres",
      operation: "bulk_resolve",
      resource: "support_tickets",
      capability: "database.write",
      arguments: { status: "RESOLVED" }
    });
    console.log(`[Agent] Bulk resolution completed. Resolved count: ${bulkResult.resolvedCount}`);
  } catch (err: any) {
    console.log(`\n[HEED INTERVENTION TRIGGERED]`);
    console.log(`  Decision: ${err.decision || "ASK / BLOCK"}`);
    console.log(`  Message:  ${err.message}`);
    if (err.reasons && err.reasons.length > 0) {
      console.log(`  Reasons:`);
      err.reasons.forEach((r: string) => console.log(`   - ${r}`));
    }
  }

  console.log("\n========================================================================");
  console.log("  Demo Workflow Concluded.");
  console.log("========================================================================\n");
}

runDemoSupportAgent().catch(console.error);
