import { Heed } from "@heed/runtime";

/**
 * HEED - External Developer Example
 * 
 * This example shows how simple it is to wrap an agent with HEED.
 * The agent requests actions, and HEED deterministically decides:
 * ALLOW, ASK, or BLOCK.
 */

// 1. Initialize HEED SDK
const heed = new Heed({
  runtimeUrl: "http://localhost:4000", // Ensure 'npm run api' is running
  agentId: "code-review-agent",
  executionId: "test-exec-1",          // In reality, generated per execution
  apiKey: "dev-key"
});

async function main() {
  console.log("Starting Simple HEED Example...");
  console.log("Agent Objective: Review a GitHub pull request.");
  
  // ---------------------------------------------------------
  // ACTION 1: Normal, allowed capability (ALLOW)
  // ---------------------------------------------------------
  console.log("\n[Agent] Requesting to read a pull request...");
  try {
    await heed.execute({
      system: "github",
      operation: "read_pull_request",
      resource: "PR-123",
      capability: "repository.read",
      arguments: { pr: 123 }
    });
    console.log("[HEED] ALLOWED. Connector executed safely.");
  } catch (error: any) {
    console.error(error.message);
  }

  // ---------------------------------------------------------
  // ACTION 2: Allowed capability, but restricted resource (BLOCK)
  // ---------------------------------------------------------
  console.log("\n[Agent] Deviating: Requesting to read credentials...");
  try {
    await heed.execute({
      system: "github",
      operation: "read_file",
      resource: ".env",
      capability: "repository.read",
      arguments: { path: ".env" }
    });
    console.log("[HEED] ALLOWED."); // We shouldn't reach here
  } catch (error: any) {
    if (error.decision === "BLOCK") {
      console.log(`[HEED] BLOCKED! Connector was NEVER invoked.`);
      console.error(`Reasons: ${error.reasons?.join(", ")}`);
    } else {
      console.error(error.message);
    }
  }

  // ---------------------------------------------------------
  // ACTION 3: Dangerous capability (ASK)
  // ---------------------------------------------------------
  console.log("\n[Agent] Requesting highly sensitive action...");
  try {
    console.log("[HEED] Pausing execution for human approval...");
    // You can see this appear in the HEED Control Plane (npm run ui)
    await heed.execute({
      system: "http",
      operation: "post",
      resource: "external-webhook",
      capability: "external_network.write",
      arguments: { payload: "secret-data" }
    });
    console.log("[HEED] Human Approved! Resumed execution.");
  } catch (error: any) {
    console.log(`[HEED] Action rejected: ${error.decision}`);
    console.error(`Reasons: ${error.reasons?.join(", ")}`);
  }
}

main().catch(console.error);
