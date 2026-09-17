# Current State of HEED

## 1. Current Architecture
HEED is structured as a monorepo containing:
- `@heed/runtime` (SDK used by agents)
- `apps/api` (Control Plane API and Runtime Gateway)
- `apps/demo-agent` (Code Review Agent demo)
- `apps/web` (Placeholder for UI)
- `packages/connectors` (GitHub, HTTP, Simulators)
- `packages/policy-engine` (Currently part of `apps/api/src/trajectory` but scaffolding exists for a standalone package)

## 2. What Is Already Implemented (WORKING)
- **HEED Branding**: The namespace is `@heed/*`.
- **Universal Action Abstraction**: The `Action` schema includes generic fields like `system`, `operation`, `resource`, and `capability`.
- **Generic Capability Model**: Integrated into `Action` and `ExecutionContract`.
- **Pre-execution Enforcement (ALLOW/BLOCK)**: The `DecisionEngine` evaluates actions through `ContractEvaluator`, `SensitivityEvaluator`, etc. `RuntimeGateway` correctly intercepts and blocks forbidden actions *before* they reach connectors.
- **Data Minimization**: `ActionNormalizer` successfully redacts secrets.
- **Real GitHub Connector**: Built with Octokit.
- **Generic HTTP Connector**: Proves the architecture is not GitHub-specific.
- **Event Storage**: Uses Prisma to persist events (ALLOWED, BLOCKED, etc).
- **Demo Scenarios**: `npm run demo` successfully demonstrates normal and deviation scenarios (both GitHub and HTTP).
- **Unit Tests**: `decision.test.ts` validates evaluator logic on universal actions.

## 3. What Is Actually Tested
- **Decision Logic**: Evaluators are unit-tested for standard ALLOW/BLOCK logic against capability and sensitivity.
- **Demo (E2E style)**: `npm run demo` runs real GitHub reviews and HTTP post requests, proving the e2e flow.

## 4. What Is Implemented (PHASE 13 & 17 Updates)
- **Event-Derived Execution Graph**: `ExecutionGraphService` dynamically reconstructs chronological execution trees directly from the Prisma `ActionEvent` tables.
- **Competition Control Plane UI**: A Vite + React + React Flow frontend provides real-time Live Execution status, interactive graph visualization, and an Intervention Panel for human approvals.
- **Trajectory Engine**: Fully deterministic `TrajectoryEvaluator` tracks capability escalation, objective deviation, and context shifts.
- **Behavioral Baseline**: `BehaviorEngine` measures actual successful events to influence deviation scores.
- **Side-Effect Proof**: Explicitly verified in `security.test.ts` and `graph.test.ts`.

## 6. Architectural Inconsistencies
- `DecisionEngine`, `InterventionManager`, and `RuntimeGateway` are inside `apps/api/src` rather than the `packages/policy-engine` or `packages/core` directories, even though those package folders were created.
- `ExecutionEngine`'s resume logic skips the gateway and attempts to run things directly (stubbed out), which risks bypassing evidence logging.

## 7. Security Weaknesses
- `ASK` throws an error to the agent, meaning if the agent retries, it might create infinite pending interventions.
- Local memory maps for state mean the backend is not stateless and restarts will lose running execution state.

## 8. Recommended Implementation Order
1. **Prove GitHub Independence (Phase 1)**: Disable GitHub connector to ensure HTTP connector works perfectly alone.
2. **Make ASK a Real Control Mechanism (Phase 2)**: Update `RuntimeGateway` to pause execution (e.g. holding the promise) and wait for a human approval via an event emitter, instead of throwing an error back to the agent.
3. **Execution State Machine (Phase 3)**: Formalize `CREATED, RUNNING, PAUSED, AWAITING_APPROVAL, COMPLETED, BLOCKED, TERMINATED, FAILED` in Prisma and validate transitions.
4. **Action Lifecycle (Phase 4)**: Ensure connector is only called after ALLOW or approved ASK.
5. **Security Bypass Tests (Phase 11)**: Write tests proving blocked actions never reach the connector and ASK pauses correctly.
6. **Flesh out Control Plane APIs (Phase 20)**.
