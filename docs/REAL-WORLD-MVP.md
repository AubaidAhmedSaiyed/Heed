# HEED: Real-World Contextual Runtime Control

## What HEED Does
HEED is a runtime control layer for autonomous software. It acts as an intelligent proxy between an AI agent and external systems. 

## The Problem
Traditional enterprise authorization models answer the question: *"Can this agent perform this action?"* (e.g., does it possess the token?). 
However, autonomous AI agents are unpredictable. The relevant question for autonomous systems is: *"Should this action happen in **this execution**?"*

An agent might technically hold the capability to delete a database, but doing so when its stated goal is "summarize yesterday's issue tickets" is a dangerous deviation. Existing RBAC policies are blind to execution intent.

## How the Runtime Works
1. **Agent Integration:** Agents integrate the `@heed/runtime` SDK. Before performing external side-effects (HTTP, GitHub, Slack), they pass a generic `Action` object to HEED.
2. **Context Evaluation:** HEED does not merely check static permissions. It evaluates the current action against the **Objective**, the **Contract**, and the **Trajectory** of previous actions.
3. **Execution Decision:** HEED computes an outcome (`ALLOW`, `ASK`, or `BLOCK`).
4. **Connector Invocation:** HEED invokes the connector natively *only* if execution is permitted. 

## The Execution Objective
An execution represents a bounded task (e.g., "Investigate issue #3812 and prepare a code change for review"). HEED maps the agent's action capabilities and resources against this objective mathematically. If an agent attempts to access restricted AWS credentials when the objective is simply fetching a PR, HEED detects an `[OBJECTIVE_DEVIATION]`.

## How Trajectory Affects Evaluation
HEED inspects the persisted `ActionEvent` history for a given execution. If an agent goes from performing purely safe file reads to suddenly requesting `external_network.write` or `credential.read` capabilities without contextual precedent, the engine flags it as a `[CAPABILITY_ESCALATION]` and blocks or pauses execution.

## The Decisions
* **ALLOW**: The action fits the execution profile. The connector natively fires.
* **BLOCK**: A hard pre-side-effect boundary. The connector is not fired, and a structured `HeedError` is returned to the agent.
* **ASK**: The action is high-risk but potentially legitimate. Execution is natively paused. The intervention appears in the Control Plane UI. A human clicks "Approve Once," and the Node.js promise dynamically resumes execution seamlessly.

## Modes: OBSERVE vs ENFORCE
Adopting runtime control on legacy agent deployments can break things.
* **OBSERVE**: HEED evaluates constraints and persists blocked intentions, but dynamically bypasses the enforcement, allowing the side-effect to proceed. Engineers can observe what *would* have broken.
* **ENFORCE**: The pre-side-effect blockage is strictly applied.

## Execution Limits
Execution contracts define strict budgets such as `maxActions` (e.g. 30 loop bounds) and `maxExternalWrites` (e.g. 1 write per PR review). This statically prevents runaways.

## Connectors & Extensibility
HEED's architecture is fully decoupled. The `RuntimeGateway` never evaluates strings like `"if system === github"`. 
- **GitHub**: Integrated via standard universal actions mapping to Octokit (e.g., `repository.read`).
- **HTTP**: A universal REST connector demonstrating GitHub-independence.
- **Custom Agents**: To use HEED, you don't need a specific agent framework. You simply wrap standard IO calls in `heed.execute()`.

## What HEED Does NOT Provide
HEED is an MVP built to prove runtime capability constraints. It does **not** currently provide:
- Enterprise SAML/SSO or full-blown IAM RBAC models.
- LLM-powered dynamic anomaly detection. (HEED strictly relies on deterministic trajectory algorithms for the MVP).
- Horizontal scalability cluster deployments.
- Subscriptions, billing, or multi-tenant namespaces.
