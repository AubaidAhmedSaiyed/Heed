# Getting Started

HEED provides an authorization layer for your AI agents.

## 1. Installation

Install the `@heed-ai/runtime` SDK in your project:
```sh
npm install @heed-ai/runtime
```

## 2. API Key and Agent Setup

To run HEED, you need:
- **`HEED_API_KEY`**: Your workspace API key. (e.g., `dev-key` for local development).
- **`HEED_AGENT_ID`**: A unique identifier for your AI agent.
- **`HEED_URL`**: The URL of your HEED control plane.

## 3. Your First Execution

Before your agent can act, it must open an **Execution**. An Execution represents a bounded task or objective.

```ts
import { Heed } from "@heed-ai/runtime";

const heed = new Heed({
  apiKey: process.env.HEED_API_KEY,
  runtimeUrl: process.env.HEED_URL,
  agentId: "my-agent-1"
});

const executionId = await heed.createExecution(
  "Review pull requests",
  {
    allowedSystems: ["github"],
    allowedCapabilities: ["repository.read", "issue.write"]
  }
);
```

## 4. The OBSERVE / ENFORCE Lifecycle

**OBSERVE** is the safest way to onboard. When your execution runs in OBSERVE mode, HEED logs every action your agent attempts, allowing you to monitor its behavior without risking accidental blocks.

Once you are comfortable with the agent's behavior, you can construct Policies and move to **ENFORCE** mode, where HEED will actively **ALLOW**, **BLOCK**, or **ASK** for human intervention before a tool executes.

## 5. Your First Action

Whenever your agent attempts to use a tool, route it through `heed.execute()`.

```ts
try {
  const result = await heed.execute({
    system: "github",
    operation: "create_issue",
    resource: "AubaidAhmedSaiyed/Pivot",
    capability: "issue.write",
    arguments: { owner: "...", repo: "...", title: "Hello World" }
  });
  console.log("Allowed! Issue:", result.number);
} catch (error) {
  // If the action is BLOCKED or requires Human Intervention (ASK), 
  // HeedError is thrown with a clear, developer-friendly explanation.
  console.error(error.message);
}
```
