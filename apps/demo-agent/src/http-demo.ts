import { Heed } from "@heed-ai/runtime";

const heed = new Heed({
  agentId: "http-agent",
  runtimeUrl: "http://localhost:4000",
  executionId: "test-exec-1",
  apiKey: "dev-key"
});

async function main() {
  console.log("[Agent] Initiating HTTP Request...");
  
  const result = await heed.execute({
    system: "http",
    operation: "post",
    resource: "httpbin",
    capability: "external_network.write",
    arguments: { 
      url: "https://httpbin.org/post",
      method: "POST",
      body: { test: "Universality check" }
    }
  });

  console.log("\n[Agent] HTTP Action ALLOWED and EXECUTED.");
  console.log("Result:", result.status);
}

main().catch(err => {
  console.error("\n[Agent] Error:", err.message);
});
