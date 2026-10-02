import { Heed, HeedError, ExecutionContract } from "@heed-ai/runtime";

async function main() {
  const apiKey = process.env.HEED_API_KEY;
  const runtimeUrl = process.env.HEED_RUNTIME_URL || "http://localhost:4000";
  const agentId = process.env.HEED_AGENT_ID || `external-agent-${Date.now()}`;
  const mode = process.argv[2] || "allow"; // 'allow', 'block', 'ask'

  if (!apiKey) {
    console.error("Missing HEED_API_KEY in environment.");
    process.exit(1);
  }

  console.log(`[Consumer] Initializing HEED Runtime for agent: ${agentId}`);
  
  // 1. Initialize HEED
  const heed = new Heed({
    apiKey,
    runtimeUrl,
    agentId
  });

  // 2. Establish Execution
  const contract: ExecutionContract = {
    allowedSystems: ["github", "fs"],
    allowedCapabilities: ["issue.write", "pull_request.read", "file.read"]
  };

  const execId = await heed.createExecution(
    `E2E Test Execution - Mode: ${mode}`,
    contract
  );
  console.log(`[Consumer] Execution established: ${execId}`);

  // 3. Perform Action based on Mode
  try {
    if (mode === "allow") {
      console.log(`[Consumer] Attempting PERMITTED action (github.read_pull_request)...`);
      const result = await heed.execute({
        idempotencyKey: `req-${Math.random()}`,
        system: "github",
        operation: "read_pull_request",
        capability: "pull_request.read",
        resource: "AubaidAhmedSaiyed/Heed/pulls/1",
        arguments: { owner: "AubaidAhmedSaiyed", repo: "Heed", pull_number: 1 }
      });
      console.log(`[Consumer] Action allowed and executed! Result snippet:`, JSON.stringify(result).substring(0, 100));

    } else if (mode === "block") {
      console.log(`[Consumer] Attempting FORBIDDEN action (fs.write_file)...`);
      await heed.execute({
        idempotencyKey: `req-${Math.random()}`,
        system: "fs",
        operation: "write_file",
        capability: "file.write",
        resource: "/etc/passwd",
        arguments: { path: "/etc/passwd", content: "hacked" }
      });
      console.error(`[Consumer] ERROR: Action was supposed to be blocked but executed!`);
      process.exit(1);

    } else if (mode === "ask") {
      console.log(`[Consumer] Attempting BOUNDED action (github.create_issue)...`);
      console.log(`[Consumer] This will pause until approved in the dashboard.`);
      const result = await heed.execute({
        idempotencyKey: `req-${Math.random()}`,
        system: "github",
        operation: "create_issue",
        capability: "issue.write",
        resource: "AubaidAhmedSaiyed/Heed/issues",
        arguments: { 
          owner: "AubaidAhmedSaiyed", 
          repo: "Heed", 
          title: `E2E External Consumer Issue ${Date.now()}`, 
          body: "This issue was requested by an external consumer and required human approval."
        }
      });
      console.log(`[Consumer] Action executed after approval! Result snippet:`, JSON.stringify(result).substring(0, 100));
    }
  } catch (error: any) {
    if (error.message.includes("GitHub Connector Error")) {
        console.log(`[Consumer] ✅ Action passed security boundary and reached connector, but connector failed due to token:`, error.message);
        process.exit(0);
    }
    if (error instanceof HeedError) {
      console.log(`[Consumer] Caught HeedError! Decision: ${error.decision}`);
      console.log(`[Consumer] Reasons:`, error.reasons);
      if (mode === "block" && error.decision === "BLOCK" && error.reasons.length > 0) {
        console.log(`[Consumer] ✅ Successfully blocked as expected.`);
        process.exit(0);
      }
    }
    
    console.error(`[Consumer] Unexpected Error:`, error);
    process.exit(1);
  }
}

main();
