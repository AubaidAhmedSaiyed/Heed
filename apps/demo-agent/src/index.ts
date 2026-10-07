import * as readline from "readline";
import { PrismaClient } from "@prisma/client";
import { Heed } from "@heed-ai/runtime";
import { Ollama } from "ollama";

const prisma = new PrismaClient();

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

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function displayCurrentTickets() {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { id: "asc" }
  });
  console.log("\n------------------------------------------------------------------------");
  console.log("  CURRENT DATABASE RECORDS (support_tickets):");
  console.log("------------------------------------------------------------------------");
  for (const t of tickets) {
    const notes = t.internalNotes ? ` | Notes: "${t.internalNotes}"` : "";
    console.log(`  [Ticket #${t.id}] [${t.status.padEnd(11)}] [${t.priority.padEnd(8)}] "${t.title}"${notes}`);
  }
  console.log("------------------------------------------------------------------------\n");
  return tickets;
}

async function processUserInstruction(instruction: string) {
  console.log("\n========================================================================");
  console.log(`[User Instruction]: "${instruction}"`);
  console.log("========================================================================\n");

  // 1. Fetch current database state
  const tickets = await prisma.supportTicket.findMany({ orderBy: { id: "asc" } });
  
  // 2. Register execution contract with HEED Cloud
  console.log("[HEED Runtime] Registering Execution Contract on Cloud...");
  const execId = await heed.createExecution(instruction, {
    objective: instruction,
    allowedSystems: ["http", "database", "postgres"],
    allowedCapabilities: ["database.read", "database.write", "external_network.write"],
    expectedActions: ["database_edit", "post"]
  });
  heed.setExecutionId(execId);
  console.log(`[HEED Runtime] Execution registered: ${execId}`);
  console.log(`[HEED Runtime] Status: ACTIVE in cloud workspace.\n`);

  // 3. Ask local Ollama (qwen3:4b) to parse intent & construct proposed DB changes
  console.log("[Ollama Agent] Analyzing instruction with local model (qwen3:4b)...");
  
  const ticketListStr = tickets.map(t => `#${t.id}: ${t.title} (Status: ${t.status}, Priority: ${t.priority})`).join(", ");
  const prompt = `You are a database management agent.
Available tickets: ${ticketListStr}
User instruction: "${instruction}"

Reply with ONLY a JSON object in this exact format:
{"ticketId": <number>, "status": "<OPEN|IN_PROGRESS|RESOLVED>", "notes": "<string explanation>"}`;

  let parsedPlan = { ticketId: 1, status: "RESOLVED", notes: "Resolved by Ollama agent" };
  
  try {
    const aiResponse = await Promise.race([
      ollama.generate({
        model: "qwen3:4b",
        prompt,
        stream: false,
        options: { num_predict: 60 }
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 15000))
    ]);

    const raw = (aiResponse as any).response.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedPlan = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback regex parsing
      const idMatch = instruction.match(/\b([1-9])\b/);
      if (idMatch) parsedPlan.ticketId = parseInt(idMatch[1], 10);
      if (instruction.toLowerCase().includes("resolve")) parsedPlan.status = "RESOLVED";
      parsedPlan.notes = instruction;
    }
  } catch (e: any) {
    const idMatch = instruction.match(/\b([1-9])\b/);
    if (idMatch) parsedPlan.ticketId = parseInt(idMatch[1], 10);
    if (instruction.toLowerCase().includes("resolve")) parsedPlan.status = "RESOLVED";
    parsedPlan.notes = instruction;
  }

  // Ensure ticket exists
  const targetTicket = tickets.find(t => t.id === parsedPlan.ticketId) || tickets[0];
  const ticketId = targetTicket.id;
  const newStatus = parsedPlan.status || "RESOLVED";
  const newNotes = parsedPlan.notes || `Updated per instruction: "${instruction}"`;

  console.log(`[Ollama Agent] Proposed Database Modification:`);
  console.log(`   - Target:   Ticket #${ticketId} ("${targetTicket.title}")`);
  console.log(`   - Changes:  Status -> ${newStatus} | Notes -> "${newNotes}"\n`);

  // 4. Submit modification to HEED Cloud Firewall (Triggers ASK / Approval)
  console.log("========================================================================");
  console.log("[HEED Runtime] Intercepting database modification request...");
  console.log("[Notice] Consequential mutation detected on persistent data store.");
  console.log("[HEED Runtime] Evaluating policy: Capability 'external_network.write' / 'database.write'...");
  console.log("========================================================================\n");

  console.log("🚨 [HEED INTERVENTION TRIGGERED: HUMAN APPROVAL REQUIRED]");
  console.log("   Policy: Modifying persistent records requires BOUND_APPROVAL.");
  console.log(`   Execution ID: ${execId}`);
  console.log("");
  console.log("👉 ACTION REQUIRED ON YOUR DASHBOARD:");
  console.log(`   1. Open: ${frontendUrl}/app/approvals`);
  console.log(`   2. Look for the pending approval for Agent '${agentId.slice(0, 8)}...'`);
  console.log("   3. Click 'Allow Once' to authorize the edit, or 'Block' to deny.");
  console.log("");
  console.log("[Agent] Waiting live for your decision on the dashboard...\n");

  try {
    const heedDecision = await heed.execute({
      system: "http",
      operation: "database_edit",
      resource: `database/support_tickets/${ticketId}`,
      capability: "external_network.write",
      arguments: {
        url: "https://httpbin.org/post",
        method: "POST",
        body: {
          action: "database_edit",
          ticketId,
          updates: { status: newStatus, internalNotes: newNotes }
        }
      }
    });

    console.log("========================================================================");
    console.log("  🎉 [HUMAN APPROVAL GRANTED ON DASHBOARD!]");
    console.log("  HEED Decision: ALLOW_ONCE received.");
    console.log("  Executing database write to PostgreSQL...");
    console.log("========================================================================\n");

    // Real database modification executed only after approval
    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        internalNotes: newNotes
      }
    });

    console.log(`[Database] Record updated successfully:`);
    console.log(`   Ticket #${updated.id}: Status is now [${updated.status}]`);
    console.log(`   Notes: "${updated.internalNotes}"\n`);
  } catch (err: any) {
    if (err.decision === "BLOCK" || err.message?.includes("blocked") || err.message?.includes("Human review: BLOCK")) {
      console.log("========================================================================");
      console.log("  ⛔ [HUMAN INTERVENTION: BLOCKED ON DASHBOARD]");
      console.log("  You clicked 'Block' or denied authorization.");
      console.log("  HEED runtime prevented the database write from occurring.");
      console.log("  The database record remains completely unchanged.");
      console.log("========================================================================\n");
    } else {
      console.error(`[Agent Status]:`, err.message);
    }
  }
}

async function startAgent() {
  console.clear();
  console.log("========================================================================");
  console.log("  🛡️  HEED GOVERNED AGENT: DATABASE TRIAGE & EDIT CONTROLLER");
  console.log("  The agent can query and propose edits, but authority is bounded by HEED.");
  console.log("========================================================================");
  console.log(`  Cloud Runtime:   ${runtimeUrl}`);
  console.log(`  Dashboard URL:   ${frontendUrl}`);
  console.log(`  Agent ID:        ${agentId}`);
  console.log(`  Local LLM:       Ollama (qwen3:4b)`);
  console.log("========================================================================\n");

  while (true) {
    await displayCurrentTickets();

    console.log("Enter an edit instruction for the agent:");
    console.log("Examples:");
    console.log("  - 'Resolve ticket 1 and note that OAuth cache was cleared'");
    console.log("  - 'Change status of ticket 2 to RESOLVED'");
    console.log("  - 'Update ticket 4 notes to: Testing under progress'");
    console.log("  - (or type 'q' to exit)\n");

    const input = await ask("agent> ");
    if (input.toLowerCase() === "q" || input.toLowerCase() === "exit") {
      console.log("\nAgent session closed.");
      await prisma.$disconnect();
      rl.close();
      process.exit(0);
    }

    if (!input.trim()) continue;

    try {
      await processUserInstruction(input);
    } catch (e: any) {
      console.error("Error running instruction:", e.message);
    }

    await ask("Press Enter to continue...");
  }
}

startAgent().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
