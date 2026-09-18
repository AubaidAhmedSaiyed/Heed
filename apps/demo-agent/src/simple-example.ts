import { Heed } from "@heed/runtime";

/**
 * HEED - External Developer Example (Real-World Execution Pass)
 * 
 * Demonstrates HEED intercepting and controlling a real autonomous agent
 * interacting with a real external system (GitHub) and webhooks.
 */

// 1. Initialize HEED SDK
const heed = new Heed({
  runtimeUrl: process.env.HEED_RUNTIME_URL || "http://localhost:4000",
  agentId: "code-review-agent",
  executionId: "test-exec-1", 
  apiKey: process.env.HEED_API_KEY || "dev-key"
});

// Environment Configuration for Target Repository
const GITHUB_OWNER = process.env.GITHUB_OWNER || "facebook";
const GITHUB_REPO = process.env.GITHUB_REPO || "react";
const GITHUB_PR_NUMBER = parseInt(process.env.GITHUB_PR_NUMBER || "10000", 10);
const GITHUB_WRITE_TEST = process.env.GITHUB_WRITE_TEST === "true";
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://httpbin.org/post";

/**
 * Conceptual generic wrapping example.
 * 
 * HEED does NOT replace your agent. Your agent still decides what it wants to do.
 * You simply route the side-effect through HEED.
 */
async function performAgentAction(intent: any) {
  // Instead of: await octokit.rest.pulls.get(intent)
  return await heed.execute({
    system: intent.system,
    operation: intent.operation,
    resource: intent.resource,
    capability: intent.capability,
    arguments: intent.arguments
  });
}

async function main() {
  console.log("Starting Real-World HEED Validation...");
  console.log(`Agent Objective: Review ${GITHUB_OWNER}/${GITHUB_REPO} pull request #${GITHUB_PR_NUMBER}`);
  console.log(`Write Mode: ${GITHUB_WRITE_TEST ? "ENABLED" : "READ_ONLY"}\n`);
  
  // ---------------------------------------------------------
  // ACTION 1: Read Pull Request (ALLOW)
  // ---------------------------------------------------------
  console.log("[Agent] ACTION 1: Requesting to read pull request...");
  try {
    const prResult = await heed.execute({
      system: "github",
      operation: "read_pull_request",
      resource: `${GITHUB_OWNER}/${GITHUB_REPO}/pull/${GITHUB_PR_NUMBER}`,
      capability: "repository.read",
      arguments: { owner: GITHUB_OWNER, repo: GITHUB_REPO, pull_number: GITHUB_PR_NUMBER }
    });
    console.log("[HEED] ALLOWED. Real GitHub Connector executed successfully.");
    console.log(`[GitHub Response] Fetched PR Title: "${prResult?.data?.title}"\n`);
  } catch (error: any) {
    console.error(`[HEED Error] ${error.message}\n`);
  }

  // ---------------------------------------------------------
  // ACTION 2: Read Diff (ALLOW)
  // ---------------------------------------------------------
  console.log("[Agent] ACTION 2: Requesting to read diff...");
  try {
    const diffResult = await heed.execute({
      system: "github",
      operation: "read_diff",
      resource: `${GITHUB_OWNER}/${GITHUB_REPO}/pull/${GITHUB_PR_NUMBER}/diff`,
      capability: "repository.read",
      arguments: { owner: GITHUB_OWNER, repo: GITHUB_REPO, pull_number: GITHUB_PR_NUMBER }
    });
    console.log("[HEED] ALLOWED. Real GitHub Connector executed successfully.");
    console.log(`[GitHub Response] Diff length: ${diffResult?.diff?.length || 0} bytes\n`);
  } catch (error: any) {
    console.error(`[HEED Error] ${error.message}\n`);
  }

  // ---------------------------------------------------------
  // ACTION 3: Post Review (Guarded by GITHUB_WRITE_TEST)
  // ---------------------------------------------------------
  if (GITHUB_WRITE_TEST) {
    console.log("[Agent] ACTION 3: Requesting to post review comment...");
    try {
      const reviewResult = await heed.execute({
        system: "github",
        operation: "post_review",
        resource: `${GITHUB_OWNER}/${GITHUB_REPO}/pull/${GITHUB_PR_NUMBER}`,
        capability: "communication.write",
        arguments: { owner: GITHUB_OWNER, repo: GITHUB_REPO, pull_number: GITHUB_PR_NUMBER, body: "LGTM (Automated review via HEED testing)" }
      });
      console.log("[HEED] ALLOWED. Real GitHub Write executed successfully.");
      console.log(`[GitHub Response] Comment posted: ID ${reviewResult?.data?.id}\n`);
    } catch (error: any) {
      console.error(`[HEED Error] ${error.message}\n`);
    }
  } else {
    console.log("[Agent] ACTION 3: Post Review skipped (GITHUB_WRITE_TEST=false)\n");
  }

  // ---------------------------------------------------------
  // ACTION 4: Restricted Resource Deviation (BLOCK)
  // ---------------------------------------------------------
  console.log("[Agent] ACTION 4: Deviating: Requesting to read credentials...");
  try {
    await heed.execute({
      system: "github",
      operation: "read_file",
      resource: ".env",
      capability: "file.read",
      arguments: { path: ".env" }
    });
    console.log("[HEED] ALLOWED."); // We shouldn't reach here
  } catch (error: any) {
    if (error.decision === "BLOCK") {
      console.log(`[HEED] BLOCKED! Connector was NEVER invoked.`);
      console.error(`Reasons: ${error.reasons?.join(", ")}\n`);
    } else {
      console.error(`[Error] ${error.message}\n`);
    }
  }

  // ---------------------------------------------------------
  // ACTION 5: Dangerous Capability (ASK)
  // ---------------------------------------------------------
  console.log("[Agent] ACTION 5: Requesting highly sensitive action (outbound HTTP)...");
  try {
    console.log("[HEED] Pausing execution for human approval...");
    // You can see this appear in the HEED Control Plane (http://localhost:3000)
    const webhookResult = await heed.execute({
      system: "http",
      operation: "post",
      resource: WEBHOOK_URL,
      capability: "external_network.write",
      arguments: { url: WEBHOOK_URL, data: { payload: "secret-data" } }
    });
    console.log("[HEED] Human Approved! Resumed execution.");
    console.log(`[HTTP Response] Webhook hit successfully: ${webhookResult?.status}\n`);
  } catch (error: any) {
    console.log(`[HEED] Action rejected: ${error.decision}`);
    console.error(`Reasons: ${error.reasons?.join(", ")}\n`);
  }
}

main().catch(console.error);
