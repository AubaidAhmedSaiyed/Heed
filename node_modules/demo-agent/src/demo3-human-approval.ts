import { Heed } from "@heed/runtime";

const heed = new Heed({
  agentId: "code-review-agent",
  runtimeUrl: "http://localhost:4000",
  executionId: "test-exec-1",
  apiKey: "dev-key"
});

async function main() {
  console.log("=========================================");
  console.log("DEMO 3: HUMAN APPROVAL (ASK)");
  console.log("=========================================\n");
  
  console.log("[Objective] Review GitHub PR #184");
  
  const action = {
    system: "http",
    operation: "post",
    resource: "slack-webhook",
    capability: "external_network.write",
    arguments: { message: "PR Review Completed" }
  };

  console.log("[Agent] Requesting consequential action:", action);
  console.log("[Agent] Waiting for HEED to evaluate and execute...\n");

  // In another terminal, a human will run the resolve script.
  console.log("(To resume, run: node apps/api/scripts/resolve-intervention.js)");

  try {
    const result = await heed.execute(action);
    console.log("\n[Agent] SUCCESS! Action completed after human intervention:", result);
  } catch (error: any) {
    console.log("\n[HEED RUNTIME EXCEPTION]");
    console.error(error.message);
  }
}

main().catch(console.error);
