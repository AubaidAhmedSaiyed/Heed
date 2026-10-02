# Executions

An **Execution** represents a single, bounded session of work for an Agent (e.g., "Review Pull Request #42", "Deploy to Staging").

All Actions must belong to an Execution. 

When you create an Execution, you supply an **Execution Contract**. The contract hard-bounds the agent for the lifetime of that session.

```ts
const executionId = await heed.createExecution(
  "Automated task execution",
  {
    allowedSystems: ["github"],
    allowedCapabilities: ["issue.write", "repository.read"],
    restrictedResources: ["secrets", "production"]
  }
);
```

If the agent attempts to access a resource explicitly restricted by the execution contract, the runtime immediately rejects the action (BLOCK).
