# HEED Phase 2 Audit Report

## A. What is actually implemented?
- **Universal Action Abstraction:** The `Action` interface with `system`, `operation`, `resource`, and `capability` is fully implemented in `@heed/runtime` and handled properly in `ActionNormalizer`.
- **Decision Engine:** Natively combines evaluator scores to produce `ALLOW`, `ASK`, and `BLOCK`.
- **Pre-execution Control:** The `RuntimeGateway` correctly evaluates actions *before* they reach the `ConnectorManager`.
- **State Machine & Control Plane:** PostgreSQL schema accurately represents execution trajectories. React Flow visually graphs this state, highlighting interventions.
- **Intervention Flow:** Natively pauses execution logic (`AWAITING_APPROVAL`) and awaits `EventEmitter` resolution from the REST UI.
- **Connectors:** 
  - `GitHubConnector` hits real APIs using `Octokit` (fully verified).
  - `HttpConnector` hits real webhooks using `fetch` (fully verified).
- **Data Minimization:** `ActionNormalizer` successfully redacts keys containing `password`, `secret`, `token` before hitting Prisma.

## B. What is actually tested?
- **Trajectory tracking:** Successfully records executed actions in Prisma and graphs them.
- **Real ASK/BLOCK functionality:** Tested against an actual `Qwen` loop demo and a manual `second-integration.ts` demo.
- **REST resolution:** The `handleResolve` in the Control Plane works against `/interventions/:id/resolve`.

## C. What is mocked?
- The generic generic string checks in `TrajectoryEvaluator` (e.g. `objective.includes("review github pr")`) are tightly coupled hardcodes acting as mock semantic reasoning.
- `BehaviorEngine` and `SequenceEvaluator` exist in the codebase but are mostly rudimentary and rely on primitive heuristics rather than advanced probability distributions.

## D. What uses a real external system?
- GitHub API via `GitHubConnector`.
- Arbitrary webhooks via `HttpConnector`.

## E. What is incomplete?
- **Observe Mode:** There is currently no `OBSERVE` vs `ENFORCE` mechanism. If it blocks, it always blocks.
- **Execution Budgets:** No limits are placed on max actions per execution.
- **Execution Replay:** Actions are tracked, but there is no specific replay/simulation endpoint.
- **Universal Custom Connectors:** The `ConnectorManager` is fairly clean but not prominently exposed in a way that proves "BYO Connector".
- **Impact System:** `DecisionEngine` generates a generic `riskScore`, but lacks a structured `LOW/MEDIUM/HIGH` action impact abstraction.

## F. What is duplicated?
- `ExecutionContract` holds limits, but `TrajectoryEvaluator` implements redundant logic. 

## G. What can be reused?
- **Prisma Schema:** Extremely well structured. `ActionEvent` and `ExecutionContract` can trivially absorb `Observe Mode` and `Impact` fields.
- **Control Plane:** React flow architecture is solid. 

## H. What would break if modified?
- The `RuntimeGateway` `processActionRequest` promise chain. The ASK state machine relies on strict async awaiting. If the engine architecture is completely refactored, the intervention promises will hang or crash.

## I. Phase 2 Features Already Partially Implemented
- **Objective-bound authorization:** `objective` is on the `Execution` and `ExecutionContract`, but evaluation is hardcoded.
- **Capability escalation:** Natively identified in `TrajectoryEvaluator`, but output is bundled generically rather than typed explicitly.
- **Termination:** The `TERMINATE_EXECUTION` enum exists in `Intervention`, but doesn't persist properly to block future actions reliably.

---

## Phase 2 Implementation Order (Prioritized Plan)

1. **Fix Broken / Hardcoded Logic (Step 2)**: Remove the `"review github pr"` hardcode from `TrajectoryEvaluator` and implement a deterministic, generic keyword/capability mapping for Objective-Bound Authorization.
2. **Execution Budgets (Step 6)**: Add `maxActions` and `maxExternalWrites` to `ExecutionContract` and enforce them in `ContractEvaluator` / `RuntimeGateway`.
3. **Observe / Enforce Mode (Step 5)**: Add `evaluationMode` to `Execution`. Modify `RuntimeGateway` to bypass the `throw` error if mode is `OBSERVE`, while accurately recording what *would* have happened.
4. **Trajectory & Capability Escalation (Step 4)**: Enhance `TrajectoryEvaluator` to return typed reasons (`CAPABILITY_ESCALATION`, `OBJECTIVE_DEVIATION`) to standardize UI presentation.
5. **Action Impact (Step 6)**: Build deterministic impact (LOW/MED/HIGH) scoring in `ActionNormalizer` based on `capability` and `resource`.
6. **Improve ASK Experience & Control Plane (Step 7/12)**: Add Impact, detailed reasons, and timeline context to the Intervention UI card.
7. **Termination (Step 9)**: Ensure `RuntimeGateway` strictly checks for `TERMINATED` status before evaluating *any* new action for that execution.
8. **Real-world Documentation & Evidence (Step 14)**: Update `EVIDENCE.md` with new features. 

*(Execution Replay and Policy Simulation are intentionally deferred to prioritize core engine reliability per the instructions).*
