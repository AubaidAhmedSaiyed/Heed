# Current State of HEED

## 1. Current Architecture
HEED is a contextual runtime control layer for autonomous agents. It consists of:
- `@heed/runtime` (SDK used by agents)
- `apps/api` (Control Plane API, Runtime Gateway, Trajectory Evaluator)
- `apps/web` (Control Plane UI + Marketing & Documentation)
- `apps/demo-agent` (Real-world deterministic proof scenarios)
- `packages/connectors` (GitHub, HTTP, Simulators)

## 2. Completed Phase 2 (Core MVP)
- **Universal Action Abstraction**: `Action` schema represents generic intents (`system`, `operation`, `resource`, `capability`, `impact`).
- **Objective-Bound Authorization**: Actions are checked for `[OBJECTIVE_DEVIATION]`.
- **Trajectory-Aware Authorization**: The engine uses the `ActionEvent` store to calculate `[CAPABILITY_ESCALATION]`.
- **Pre-execution Enforcement**: Actions are evaluated *before* they reach external connectors. 
- **Observe vs. Enforce Mode**: Structural recording without blocking when in `OBSERVE` mode.
- **Execution Budgets**: Implemented constraints (`maxActions` and `maxExternalWrites`).
- **ASK Interventions**: Real Node.js promise hold/pause mechanism.
- **Data Minimization**: Secret payloads are statically redacted.

## 3. Completed Phase 3 (Observability & Intelligence)
- **Agent Intelligence**: Deterministic action tracking, counting `ALLOWED`, `BLOCKED`, and `ASK` actions per agent and execution.
- **Behavior Change Detection**: The UI explicitly flags when agents attempt `[CAPABILITY_ESCALATION]` or `[OBJECTIVE_DEVIATION]`, contrasting recent actions with established context.
- **Expanded Control Plane**: Added new routing and pages for Overview metrics, Agents List, Agent Detail, Executions List, and Behavior Changes tracking.
- **Benchmark Tooling**: Added a controlled deterministic behavioral benchmark (`benchmark.ts`) proving that contextual HEED evaluation correctly outperforms static RBAC checks, measuring latency per evaluation (p95 ~0.108ms).

## 3. What Is Actually Tested
The file `apps/demo-agent/src/final-mvp-audit.ts` programmatically verifies the following invariant flows end-to-end:
1. `OBSERVE` mode bypasses blocks successfully.
2. `ENFORCE` mode blocks objective deviations natively.
3. Execution budgets (`EXECUTION_LIMIT`) immediately halt execution and deny side-effects.
4. `ASK` interventions suspend the script, fetch data, wait for an external API response, and safely resume.
5. Secrets are demonstrably proven to be `[REDACTED]` in the Postgres payload.

## 4. Architectural Inconsistencies & Weaknesses (Future Phases)
- **Scalability**: The backend uses in-memory EventEmitters for the `ASK` promise resolution. If the Node.js API reboots during an `ASK` cycle, the client SDK will time out and the promise is orphaned.
- **Stateless Execution Constraints**: The database is stateful, but intervention routing is tied to the memory space of a single running API instance.
- **Authentication**: Relies on a hardcoded API key for simplicity in the MVP. Real RBAC/SSO is required before enterprise deployment.
- **Connectors**: The current set is limited to HTTP and public GitHub actions. More enterprise-focused integrations (Slack, AWS, Stripe) must be scaffolded.
