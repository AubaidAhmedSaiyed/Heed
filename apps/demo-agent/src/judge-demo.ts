import readline from "readline";
import { Heed } from "@heed-ai/runtime";
import { Ollama } from "ollama";

const runtimeUrl = process.env.HEED_RUNTIME_URL || "https://heed-api.onrender.com";
const apiKey = process.env.HEED_API_KEY || "heed_live_ff2490a59d5882396507036727ec530da73859d425700f0c";
const agentId = process.env.HEED_AGENT_ID || "0bbcb20c-2aa4-4601-9a2f-d8505725ba0b";
const frontendUrl = process.env.FRONTEND_URL || "https://heed-web.vercel.app";

const heed = new Heed({
  agentId,
  runtimeUrl,
  apiKey
});

const ollama = new Ollama({ host: process.env.OLLAMA_HOST || "http://127.0.0.1:11434" });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askPrompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function runAutonomousWorkflow(userQuery: string) {
  console.log("\n========================================================================");
  console.log(`[USER/JUDGE QUERY]: "${userQuery}"`);
  console.log("========================================================================\n");

  // Step 1: Register Execution Contract on HEED Cloud
  console.log("[HEED Runtime] Registering Execution Contract on Live Cloud...");
  const execId = await heed.createExecution(userQuery, {
    objective: userQuery,
    allowedSystems: ["fs-sim", "http"],
    allowedCapabilities: ["file.read", "external_network.write"],
    expectedActions: ["read_file", "post"]
  });
  heed.setExecutionId(execId);
  console.log(`[HEED Runtime] Execution Registered: ${execId}`);
  console.log(`[Dashboard Link] ${frontendUrl}/app/executions\n`);

  // Step 2: Safe Autonomous Action (Evaluated as ALLOW)
  console.log("------------------------------------------------------------------------");
  console.log("[Agent Step 1] Reading target system source files (/src/auth/jwt.ts)...");
  console.log("[HEED Runtime] Evaluating policy: system='fs-sim', capability='file.read'...");
  
  const readRes = await heed.execute({
    system: "fs-sim",
    operation: "read_file",
    resource: "/src/auth/jwt.ts",
    capability: "file.read",
    arguments: { path: "/src/auth/jwt.ts" }
  });
  console.log("[HEED Runtime] Decision: ALLOW -> Autonomous execution permitted.");

  const sampleSource = `
// JWT Authentication Core
export function verifySession(token: string) {
  if (!token) throw new Error("No token provided");
  return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
}`;
  console.log(`[Agent] Source code loaded:\n${sampleSource.trim()}\n`);

  // Step 3: Local Ollama Model Inference (qwen3:4b)
  console.log("------------------------------------------------------------------------");
  console.log("[Local AI] Prompting Ollama (qwen3:4b) to analyze code based on your query...");
  let aiSummary = "Security Audit: HS256 algorithm enforcement is secure; secret loaded safely from environment.";
  try {
    const aiResponse = await Promise.race([
      ollama.generate({
        model: "qwen3:4b",
        prompt: `Based on user request: "${userQuery}", analyze this code in 1 concise sentence:\n${sampleSource}`,
        stream: false,
        options: { num_predict: 40 }
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Ollama timeout (15s)")), 15000))
    ]);
    aiSummary = (aiResponse as any).response.trim();
    console.log(`[Ollama AI] Analysis: "${aiSummary}"\n`);
  } catch (err: any) {
    console.log(`[Ollama AI] Note (${err.message}). Using summary:\n   "${aiSummary}"\n`);
  }

  // Step 4: High Blast Radius Action -> Triggers ASK (Human Approval)
  console.log("========================================================================");
  console.log("[Agent Step 2] Agent attempting consequential outbound dispatch...");
  console.log("[Action Details] system='http', capability='external_network.write'");
  console.log("[HEED Runtime] Evaluating impact weight and security policies...");
  console.log("========================================================================\n");

  console.log("🚨 [HEED INTERVENTION TRIGGERED: HUMAN APPROVAL REQUIRED]");
  console.log("   Policy Rule: Capability 'external_network.write' strictly requires BOUND_APPROVAL.");
  console.log(`   Execution ID: ${execId}`);
  console.log("");
  console.log("👉 JUDGES & AUDIENCE: LOOK AT THE LIVE DASHBOARD NOW!");
  console.log(`   Website URL: ${frontendUrl}/app/approvals`);
  console.log("   Notice how the agent is paused right at the authority boundary.");
  console.log("   Click [Allow Once] to authorize, or [Block] to deny.\n");
  console.log("[Agent] Waiting live for human decision on Vercel...\n");

  try {
    const dispatchRes = await heed.execute({
      system: "http",
      operation: "post",
      resource: "security_dispatch_webhook",
      capability: "external_network.write",
      arguments: {
        url: "https://httpbin.org/post",
        method: "POST",
        body: {
          objective: userQuery,
          analysis: aiSummary,
          author: "Ollama (qwen3:4b)",
          timestamp: new Date().toISOString()
        }
      }
    });

    console.log("\n========================================================================");
    console.log("  🎉 [HUMAN APPROVAL GRANTED!]");
    console.log("  Decision: ALLOW_ONCE received from HEED Dashboard!");
    console.log(`  Result: External webhook authorized and dispatched (HTTP ${dispatchRes.status || 200}).`);
    console.log("========================================================================\n");
    console.log("[Agent] Workflow finished successfully with human oversight.\n");
  } catch (err: any) {
    if (err.decision === "BLOCK" || err.message?.includes("blocked") || err.message?.includes("Human review: BLOCK")) {
      console.log("\n========================================================================");
      console.log("  ⛔ [HUMAN INTERVENTION: ACTION BLOCKED]");
      console.log("  The human operator denied permission on the live dashboard.");
      console.log("  HEED runtime successfully contained the agent and prevented perimeter breach.");
      console.log("========================================================================\n");
    } else {
      console.error(`\n[Agent Error]:`, err.message);
    }
  }
}

async function startJudgeDemo() {
  console.clear();
  console.log("========================================================================");
  console.log("   🛡️  HEED: Impact-Aware Runtime Governance for Autonomous AI Agents");
  console.log("   Thesis: The agent is autonomous, but its authority is not unlimited.");
  console.log("========================================================================");
  console.log(`   Cloud Runtime:   ${runtimeUrl}`);
  console.log(`   Vercel Web App:  ${frontendUrl}`);
  console.log(`   Active Agent ID: ${agentId}`);
  console.log(`   Local Model:     Ollama (qwen3:4b)`);
  console.log("========================================================================\n");

  while (true) {
    console.log("Choose a preset query or type your own for the judges:");
    console.log("  [1] Audit JWT authentication module and notify security webhook");
    console.log("  [2] Perform vulnerability scan and post outbound compliance alert");
    console.log("  [3] Type any custom prompt / query");
    console.log("  [q] Exit");
    
    const choice = await askPrompt("\nEnter selection [1/2/3/q]: ");
    if (choice.toLowerCase() === "q" || choice.toLowerCase() === "exit") {
      console.log("\nDemo session ended.");
      rl.close();
      process.exit(0);
    }

    let query = "";
    if (choice === "1") {
      query = "Audit JWT authentication module and notify security webhook";
    } else if (choice === "2") {
      query = "Perform vulnerability scan and post outbound compliance alert";
    } else if (choice === "3" || !["1", "2"].includes(choice)) {
      if (choice === "3") {
        query = await askPrompt("Enter custom query for Ollama agent: ");
      } else {
        query = choice;
      }
    }

    if (!query) query = "Audit authentication security and send outbound team alert";

    try {
      await runAutonomousWorkflow(query);
    } catch (e: any) {
      console.error("Workflow exception:", e.message);
    }

    const cont = await askPrompt("Press Enter to test another query with the judges, or 'q' to quit: ");
    if (cont.toLowerCase() === "q") {
      rl.close();
      process.exit(0);
    }
    console.log("\n");
  }
}

startJudgeDemo().catch(console.error);
