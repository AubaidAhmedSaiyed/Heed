# HEED

**Runtime control for autonomous software.**

HEED sits between AI agents and the tools they use.
Before consequential actions reach external systems,
HEED can ALLOW, BLOCK, or ASK for human approval.

## Quickstart

```sh
npm install @heed-ai/runtime
```

```ts
import { Heed } from "@heed-ai/runtime";

// 1. Initialize HEED
const heed = new Heed({
  apiKey: process.env.HEED_API_KEY,
  runtimeUrl: "http://localhost:4000",
  agentId: "my-agent-id"
});

// 2. Execute an action
try {
  const result = await heed.execute({
    system: "github",
    operation: "create_issue",
    resource: "AubaidAhmedSaiyed/Pivot",
    capability: "issue.write",
    arguments: { owner: "AubaidAhmedSaiyed", repo: "Pivot", title: "Hello World" }
  });
  console.log("Allowed! Issue created:", result.number);
} catch (error) {
  // Gracefully handle BLOCK or ASK policies
  console.error(error.message);
}
```

## Documentation

- [Getting Started](docs/getting-started.md)
- [SDK Reference](docs/sdk.md)

### Concepts
- [Agents](docs/concepts/agents.md)
- [Actions](docs/concepts/actions.md)
- [Executions](docs/concepts/executions.md)
- [Policies](docs/concepts/policies.md)

### Runtime
- [Decisions (ALLOW, BLOCK, ASK)](docs/runtime/decisions.md)

## Developer Setup

To run HEED locally and test the Control Plane and API:

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Build workspace packages
npm run build

# 4. Start the backend API (runs on port 4000)
npm run dev --workspace=api

# 5. Start the frontend Dashboard (runs on port 5173)
npm run dev --workspace=web
```

To test the external agent consumer flow, see `docs/founder-self-test.md`.
