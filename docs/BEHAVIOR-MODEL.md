# HEED Behavior Model

HEED implements a contextual authorization boundary, not just a static permission checker.

## Static RBAC vs. Contextual Evaluation

In a traditional RBAC system, an agent is either allowed to use `external_network.write` or it isn't. If the token allows it, the agent can use it at any time.

In HEED's contextual model, the exact same action can receive completely different decisions depending on the **Objective** and the **Trajectory**.

### Example Scenario
**Action:** `external_network.write` (POST to webhook)

#### Execution A
- **Objective:** "Send the approved incident notification."
- **Trajectory:** `incident.read` -> `incident.analyze` -> `notification.prepare`
- **HEED Decision:** `ALLOW` (or `ASK`)

#### Execution B
- **Objective:** "Summarize the incident internally."
- **Trajectory:** `incident.read` -> `credential.read` -> `external_network.write`
- **HEED Decision:** `BLOCK`

In Execution B, HEED recognizes an abrupt capability escalation and a deviation from the stated objective (which was internal summarization, not external transmission). It blocks the action *even if the agent hypothetically possessed the capability in its contract*.

## Evaluation Harness
Developers can verify this logic directly using the `benchmark.ts` script in the `apps/demo-agent` package. The benchmark runs 50 contextual scenarios against the HEED runtime engine and compares the decisions against a static RBAC system, consistently proving higher contextual accuracy.
