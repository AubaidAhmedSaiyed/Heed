import { Heed } from "@heed-ai/runtime";

/**
 * Demo 4: Incident Response Agent (Non-GitHub)
 * 
 * Demonstrates:
 * 1. SDK integration with createExecution
 * 2. Provenance tagging (PII, SECRET)
 * 3. Information Flow Control (blocking PII -> EXTERNAL_WEBHOOK)
 * 4. Bound Approval required for destructive capabilities
 */
async function runDemo() {
  const heed = new Heed({
    agentId: "incident-responder-001",
    runtimeUrl: "http://localhost:4000",
    apiKey: "dev-key"
  });

  console.log("==========================================");
  console.log("HEED DEMO 4: Incident Response Agent");
  console.log("==========================================");

  // 1. Initialize execution with contract and policies
  console.log("\n[1] Creating Execution with IFC Policy...");
  const executionId = await heed.createExecution(
    "Investigate database anomaly, gather logs, and notify on-call.",
    {
      objective: "Investigate database anomaly, gather logs, and notify on-call.",
      expectedActions: ["read_db_logs", "send_slack", "query_users", "post_webhook"],
      allowedSystems: ["http", "slack", "database"],
      allowedCapabilities: ["internal_api.read", "communication.write", "external_network.write", "database.destroy"],
      flowRules: [
        {
          id: "rule-1",
          priority: 10,
          sourceLabels: ["PII"],
          destinationTypes: ["EXTERNAL_WEBHOOK", "PUBLIC_WEB"],
          decision: "BLOCK",
          reason: "Customer PII cannot be sent to external webhooks without redaction"
        }
      ],
      // Requires human approval for any DB destruction
      forbiddenCapabilities: [],
      forbiddenResourcePatterns: [],
      forbiddenProvenance: [],
      noGoPatterns: [],
      restrictedResources: [],
      terminationConditions: []
    }
  );
  console.log(`✅ Execution started: ${executionId}`);

  // 2. Wrap tools
  const dbQuery = heed.wrapTool(
    async (query: string) => { return { users: ["alice@example.com", "bob@example.com"] }; },
    { system: "http", operation: "post", capability: "internal_api.read", resource: "http://internal-db-api/query" }
  );

  const postWebhook = heed.wrapTool(
    async (payload: any) => { return { success: true }; },
    { 
      system: "http", 
      operation: "post", 
      capability: "external_network.write", 
      resource: "https://external-monitoring.com/ingest",
      destination: { type: "EXTERNAL_WEBHOOK", identifier: "monitoring.com" } as any
    }
  );

  // 3. Agent queries database and marks provenance
  console.log("\n[2] Agent queries database...");
  const dbResult = await dbQuery("SELECT * FROM users LIMIT 2");
  console.log(`Local tool result:`, dbResult);
  
  // Tag data with provenance
  console.log("\n[3] Marking retrieved data as PII...");
  heed.provenance.mark(["PII"], "database.users");

  // 4. Agent attempts to exfiltrate PII to an external webhook
  console.log("\n[4] Agent attempts to send PII to external webhook...");
  try {
    await postWebhook({ logs: "Anomaly detected", affected_users: dbResult.users });
  } catch (error: any) {
    console.log(`❌ HEED BLOCKED ACTION:`);
    console.log(`   Decision: ${error.decision}`);
    console.log(`   Reasons:`, error.reasons);
    console.log(`   (Information Flow Control rule triggered: PII -> EXTERNAL)`);
  }
}

runDemo().catch(console.error);
