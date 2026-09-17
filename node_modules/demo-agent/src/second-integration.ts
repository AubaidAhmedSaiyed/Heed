import { Heed, HeedError } from "@heed/runtime";

// A completely fake arbitrary agent (e.g. LangChain, AutoGPT, custom script)
class MyArbitraryAgent {
  constructor(private heed: Heed) {}

  async runTask() {
    console.log("Arbitrary Agent: Generating an action to perform...");
    
    // Instead of doing it directly, it passes the intent to HEED.
    try {
      const result = await this.heed.execute({
        system: "github",
        operation: "read_pull_request",
        resource: "arbitrary/repo/1",
        capability: "repository.read",
        arguments: { owner: "arbitrary", repo: "repo", pull_number: 1 }
      });
      console.log("Arbitrary Agent: Action allowed and executed! Result:", result.status);
    } catch (e: any) {
      if (e instanceof HeedError && e.decision === "BLOCK") {
        console.error("Arbitrary Agent: HEED blocked my action. I must change my plan.", e.reasons);
      } else {
        console.error("Arbitrary Agent: Execution failed:", e.message);
      }
    }
  }
}

async function main() {
  const heed = new Heed({
    runtimeUrl: "http://localhost:4000",
    agentId: "my-arbitrary-agent",
    executionId: "exec-999",
    apiKey: "dev-key"
  });

  const agent = new MyArbitraryAgent(heed);
  await agent.runTask();
}

main().catch(console.error);
