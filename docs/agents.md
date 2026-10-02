# Agents

In HEED, an **Agent** is simply an identifier (`agentId`) that maps your upstream AI actor to a specific Workspace in the HEED Control Plane. 

You do not need to rewrite your agent logic to use HEED; you simply initialize the `@heed-ai/runtime` SDK with your `agentId`.

```ts
const heed = new Heed({
  agentId: "my-custom-agent"
});
```

The control plane uses this ID to aggregate executions, trace provenance, and assign metrics.
