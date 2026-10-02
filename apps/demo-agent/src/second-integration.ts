import { Heed, HeedError } from "@heed-ai/runtime";

class UniversalAgent {
  constructor(private heed: Heed) {}

  async runTask() {
    console.log("=========================================");
    console.log("HEED UNIVERSAL EXECUTION DEMONSTRATION");
    console.log("=========================================\n");
    console.log("Agent Objective: Send a notification\n");

    // ---------------------------------------------------------
    // ACTION 1: Generic HTTP Notification (ASK)
    // ---------------------------------------------------------
    console.log("[Agent] ACTION 1: Requesting to send a webhook notification...");
    try {
      console.log("[HEED] Pausing execution for human approval...");
      const webhookResult = await this.heed.execute({
        system: "http",
        operation: "post",
        resource: "https://httpbin.org/post",
        capability: "external_network.write",
        arguments: { url: "https://httpbin.org/post", data: { message: "Hello from Universal Agent" } }
      });
      console.log("[HEED] Human Approved! Resumed execution.");
      console.log(`[HTTP Response] Webhook hit successfully: ${webhookResult?.status}\n`);
    } catch (e: any) {
      console.log(`[HEED] Action rejected: ${e.decision}`);
      console.error(`Reasons: ${e.reasons?.join(", ")}\n`);
    }

    // ---------------------------------------------------------
    // ACTION 2: Generic Capability Violation (BLOCK)
    // ---------------------------------------------------------
    console.log("[Agent] ACTION 2: Deviating: Attempting to process a payment...");
    try {
      await this.heed.execute({
        system: "stripe",
        operation: "create_charge",
        resource: "billing/customer/789", // Hits restricted resource "billing"
        capability: "payment.write",
        arguments: { amount: 5000, currency: "usd" }
      });
      console.log("[HEED] ALLOWED."); // Should never reach here
    } catch (e: any) {
      if (e instanceof HeedError && e.decision === "BLOCK") {
        console.log(`[HEED] BLOCKED! Connector was NEVER invoked.`);
        console.error(`Reasons: ${e.reasons?.join(", ")}\n`);
      } else {
        console.error(`[Error] ${e.message}\n`);
      }
    }
  }
}

async function main() {
  const heed = new Heed({
    runtimeUrl: process.env.HEED_RUNTIME_URL || "http://localhost:4000",
    agentId: "generic-agent",
    executionId: "test-exec-2",
    apiKey: process.env.HEED_API_KEY || "dev-key"
  });

  const agent = new UniversalAgent(heed);
  await agent.runTask();
}

main().catch(console.error);
