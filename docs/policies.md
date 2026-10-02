# Policies

A **Policy** is a dynamic, server-side rule evaluated by the HEED Decision Engine. 

Unlike an Execution Contract (which bounds a single task session), Policies are configured globally in your Workspace and apply to all agents.

Policies can define:
- **No-Go Patterns**: Regular expressions blocking specific payload data (e.g., SSNs or API keys).
- **Forbidden Capabilities**: Capabilities that immediately trigger a BLOCK.
- **Bound Approval**: Capabilities that immediately trigger an ASK (Human Intervention) before proceeding.

Example Policy evaluation:
If a policy binds `issue.close` to **Human Approval**, the agent's attempt to close a GitHub issue will be intercepted and the execution will pause in an `AWAITING_APPROVAL` state.
