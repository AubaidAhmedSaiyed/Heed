import { Heed, HeedError } from "@heed-ai/runtime";

// In a real application, you would load these securely (e.g., using 'dotenv')
const HEED_API_KEY = process.env.HEED_API_KEY || "dev-key";
const HEED_URL = process.env.HEED_URL || "http://localhost:4000";
const HEED_AGENT_ID = process.env.HEED_AGENT_ID || "code-review-agent";

async function main() {
  console.log("🚀 Starting HEED Quickstart");

  // 1. Initialize HEED
  const heed = new Heed({
    apiKey: HEED_API_KEY,
    runtimeUrl: HEED_URL,
    agentId: HEED_AGENT_ID
  });

  // 2. Create an Execution (Agent session)
  console.log("\n📦 Creating new Execution Context...");
  const executionId = await heed.createExecution(
    "Automated task execution",
    {
      expectedActions: ["create_issue", "read_pull_request"],
      allowedSystems: ["github"],
      allowedCapabilities: ["issue.write", "repository.read", "issue.close"],
      restrictedResources: ["secrets"] // We will test blocking this
    }
  );
  console.log(`✅ Execution created: ${executionId}`);

  // 3. Demonstrate ALLOW Flow
  console.log("\n▶️ 1. OBSERVE / ALLOW: Legitimate Action");
  try {
    const allowResult = await heed.execute({
      system: "github",
      operation: "create_issue",
      resource: "AubaidAhmedSaiyed/Pivot",
      capability: "issue.write",
      arguments: {
        owner: "AubaidAhmedSaiyed",
        repo: "Pivot",
        title: `Quickstart Issue ${Date.now()}`,
        body: "Created by HEED quickstart"
      }
    });
    console.log(`✅ ACTION ALLOWED! External side effect successful. Issue #${allowResult.number}`);
  } catch (error) {
    console.error("❌ Action failed:", error);
  }

  // 4. Demonstrate BLOCK Flow
  console.log("\n▶️ 2. ENFORCE / BLOCK: Contract Violation");
  try {
    console.log("Attempting to access restricted resource 'secrets'...");
    await heed.execute({
      system: "github",
      operation: "read_secret",
      resource: "secrets", // Violates restrictedResources
      capability: "repository.read",
      arguments: { name: "GITHUB_TOKEN" }
    });
    console.error("❌ Action should have been blocked!");
  } catch (error) {
    if (error instanceof HeedError) {
      console.log(`✅ ACTION BLOCKED successfully.`);
      console.log(error.message); // Will print the developer-friendly block error
    } else {
      console.error("Unexpected error:", error);
    }
  }

  // 5. Demonstrate ASK Flow
  // To demonstrate this, we first need to dynamically register a policy that requires BOUND_APPROVAL.
  console.log("\n▶️ 3. INTERVENTION / ASK: Human-in-the-Loop");
  console.log("Setting up dynamic policy requiring BOUND_APPROVAL for issue.close capability...");
  await fetch(`${HEED_URL}/api/policies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Quickstart Approval Policy",
      boundApprovalCapabilities: ["issue.close"]
    })
  });

  try {
    console.log("Attempting to close issue... (Hangs until approved via API)");
    
    // Fire the execute asynchronously so we can auto-approve it for the quickstart demonstration
    const executionPromise = heed.execute({
      system: "github",
      operation: "create_issue",
      resource: "AubaidAhmedSaiyed/Pivot",
      capability: "issue.close", 
      arguments: {
        owner: "AubaidAhmedSaiyed",
        repo: "Pivot",
        title: `Issue to Close ${Date.now()}`
      }
    });
    
    // Simulate Human Approval via API
    setTimeout(async () => {
      const invReq = await fetch(`${HEED_URL}/interventions`);
      const pending = (await invReq.json()).find((i: any) => i.executionId === executionId && i.status === "PENDING");
      if (pending) {
        console.log(`🧑‍💻 Human resolving intervention ${pending.id} with ALLOW...`);
        await fetch(`${HEED_URL}/interventions/${pending.id}/resolve`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${HEED_API_KEY}` },
          body: JSON.stringify({ decision: "ALLOW", reason: "Approved via quickstart" })
        });
      }
    }, 2000);

    const askResult = await executionPromise;
    console.log(`✅ ACTION ALLOWED after human intervention! External side effect successful. Issue #${(askResult as any).number}`);
    
  } catch (error) {
    if (error instanceof HeedError) {
      console.log(`⏸️ ACTION PAUSED OR DENIED by human intervention.`);
      console.log(error.message);
    }
  }

  console.log("\n🎉 Quickstart complete!");
}

main().catch(console.error);
