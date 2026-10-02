# SDK Reference

## `Heed`

The main class used to interact with the HEED runtime.

### `constructor(config)`
- `apiKey`: Your HEED Workspace API Key.
- `runtimeUrl`: The URL of the HEED control plane.
- `agentId`: The string identifier of your AI Agent.

### `createExecution(objective, contract, authority)`
Creates a new bounded task execution for the agent.
- `objective`: A string describing what the agent is trying to do.
- `contract`: An `ExecutionContract` defining the bounds of the task (e.g. `allowedSystems`, `restrictedResources`).

### `execute(action)`
Sends an action to HEED for evaluation. 
- Returns the remote connector's response payload natively if **ALLOW**.
- Throws a `HeedError` if **BLOCK** or **ASK**.

### `wrapTool(toolFn, metadata)`
A convenience method to automatically wrap your local agent tools with HEED's evaluation firewall. It automatically evaluates the action metadata before executing `toolFn`.

## `HeedError`
Thrown when an action is rejected.
- `decision`: Will be `"BLOCK"`, `"ASK"`, or `"BOUND_APPROVAL"`.
- `message`: A developer-friendly string outlining exactly why the action was rejected and what policies were violated.
