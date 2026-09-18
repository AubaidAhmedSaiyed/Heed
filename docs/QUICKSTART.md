# HEED Quickstart

## 1. What HEED is
HEED is a runtime control layer for autonomous agents. It evaluates an agent's intended actions against its objective and context *before* the external side effect actually happens.

## 2. Why it exists
If your agent gets prompt-injected or hallucinates, you don't want it freely executing code, reading credentials, or making unauthorized HTTP requests. HEED acts as the deterministic firewall that guarantees dangerous or out-of-context actions are blocked at runtime.

## 3. Install SDK
```bash
# In your agent's codebase
npm install @heed/runtime
```

## 4. Start HEED runtime
HEED runs as a separate API gateway.
```bash
# Clone HEED repository and run:
npm install
npm run api
```

## 5. Create an Agent & Define Execution Contract
In HEED, an execution needs a contract specifying what it is allowed to do.

```typescript
const contract = {
  objective: "Review pull request #123",
  allowedSystems: ["github"],
  allowedCapabilities: ["repository.read"],
  restrictedResources: [".env", "secrets"]
};
// HEED loads this via its API/database when the execution begins.
```

## 6. Send an Action through HEED
Wrap your agent. Instead of calling `fetch` or `Octokit` directly, use the system-agnostic SDK:

```typescript
import { Heed } from "@heed/runtime";

const heed = new Heed({
  runtimeUrl: "http://localhost:4000",
  agentId: "my-code-reviewer",
  executionId: "exec-123", // Unique per task run
  apiKey: "dev-key"
});

try {
  // 1. Agent asks to do something normal
  await heed.execute({
    system: "github",
    operation: "read_pull_request",
    resource: "repo/pr/123",
    capability: "repository.read",
    arguments: { pr: 123 }
  });
  console.log("Action succeeded!");
} catch (error) {
  console.error("Action rejected:", error.message);
}
```

## 7. OBSERVE vs ENFORCE Mode
By default, executions run in **ENFORCE** mode where dangerous actions are halted. To safely test HEED in production without breaking your agent, you can set the execution mode to **OBSERVE**:

```typescript
// On the backend database:
await prisma.execution.update({ 
  where: { id: "exec-123" }, 
  data: { evaluationMode: "OBSERVE" } 
});
```
In OBSERVE mode, HEED evaluates actions and logs `BLOCK` events to the Control Plane for you to review, but natively bypasses enforcement, allowing the side-effect to proceed.

## 8. Understand ALLOW / ASK / BLOCK
When `heed.execute` runs, the HEED runtime evaluates the context (objective, contract, trajectory, and limits):

- **ALLOW**: The action aligns. The connector natively fires.
- **BLOCK**: The action deviated (e.g. attempting to read `.env` when the objective is "summarize issue", or hitting `maxActions` budget). The Promise rejects. *The connector is never invoked.*
- **ASK**: High-risk action requires human review. The Node.js Promise natively pauses `await heed.execute(...)` until a human resolves it in the HEED UI.

## 9. Connect a Real System
HEED maintains system Connectors on the backend. When HEED yields ALLOW, the Connector executes the action against the real API using its own secure credentials (e.g., `GITHUB_TOKEN`). This prevents the agent from holding unrestricted API keys.

## 10. Inspect the Execution
Start the HEED Control Plane:
```bash
npm run ui
```
Open `http://localhost:3000` to see the live execution graph, decision reasons, mode status, and manage paused `ASK` actions.
