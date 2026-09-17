# HEED

HEED is a runtime control layer for autonomous agents that evaluates consequential actions before they reach external systems.

```
Agent
  ↓
HEED
  ↓ (ALLOW / ASK / BLOCK)
External system
```

## Why do I need it?
If your agent gets prompt-injected or hallucinates, you don't want it freely executing code, reading credentials, or making unauthorized HTTP requests. HEED acts as the deterministic firewall that guarantees dangerous or out-of-context actions are blocked at runtime.

## Installation

```bash
# 1. Clone HEED repository and install dependencies
git clone https://github.com/heed/heed.git
cd heed
npm install

# 2. Configure environment (copy .env.example if available)
# Required for DB: DATABASE_URL="postgresql://user:pass@localhost:5432/heed"
# Required for Auth: HEED_API_KEY="dev-key"

# 3. Start the HEED runtime API
npm run api

# 4. Start the Control Plane UI (Optional, but recommended)
npm run ui
```

## How do I wrap my agent?

In your agent's codebase, install the SDK:

```bash
npm install @heed/runtime
```

Then route external actions through HEED instead of calling them directly:

```typescript
import { Heed, HeedError } from "@heed/runtime";

const heed = new Heed({
  runtimeUrl: "http://localhost:4000",
  agentId: "my-first-agent",
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
  console.log("Action ALLOWED. Connector executed safely.");
} catch (error) {
  if (error instanceof HeedError) {
    console.error(`Action ${error.decision}:`, error.reasons.join(", "));
  }
}
```

## What happens when an action is blocked?
If HEED evaluates that the action deviates from the objective (e.g. attempting to read `.env`), the Promise throws a `HeedError` with `decision: "BLOCK"`. *The external connector is never invoked.*

## How do I inspect it?
Open `http://localhost:3000` to see the live execution graph, decision reasons, and manage paused `ASK` actions.
