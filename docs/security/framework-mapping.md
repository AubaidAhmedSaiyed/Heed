# Framework Mapping

HEED does not attempt to be a general-purpose AI security tool. It focuses strictly on **runtime authorization**. We map HEED's implemented controls to industry frameworks to demonstrate how our architecture addresses established risks.

## Framework Mapping Table

| Framework | Risk / Principle | HEED Control | Implementation | Test |
| :--- | :--- | :--- | :--- | :--- |
| **OWASP Agentic AI** | Excessive Agency | Capability contracts & `ContractEvaluator` | `RuntimeGateway` | `HEED-012` |
| **OWASP Agentic AI** | Human Oversight | Bound Approval / `ASK` decisions | `InterventionManager` | `HEED-006` / `007` |
| **OWASP LLM** | Sensitive Information Disclosure | Provenance & IFC Flow Rules | `PolicyEvaluator` | `HEED-001` / `002` |
| **OWASP LLM** | Prompt Injection (Action phase) | Runtime action interception & evaluation | `RuntimeGateway` | `HEED-011` |
| **MITRE ATLAS** | ML Execution (AML.T0005) | Contract constraints & No-Go patterns | `DecisionEngine` | `HEED-009` |
| **NIST AI RMF** | GOVERN | Immutable policy snapshots | Policy Models | `tests/unit/policy` |
| **NIST AI RMF** | MAP | Execution Context & Trajectory | `TrajectoryEvaluator` | `HEED-003` |

---

## 1. OWASP Agentic AI

### Excessive Agency
Agents frequently possess tools that allow them to perform broad, destructive actions if given malicious input. HEED limits agent agency through **Execution Contracts**. An agent cannot simply invoke tools out of convenience; the `ContractEvaluator` verifies that the `capability` required for an operation is explicitly allowed in the current contract. If it isn't, HEED forces the action to an `ASK` (human intervention) state.

### Tool / Action Misuse
Rather than attempting to filter the inputs going into an agent's context (which is highly vulnerable to injection), HEED wraps the execution layer itself.
```text
Agent → wrapTool() → HEED Runtime → Policy Evaluation → Connector
```
This forces all physical consequences (network calls, DB writes) through a hard authorization boundary, mitigating tool misuse regardless of the agent's internal reasoning.

### Human Oversight
Certain destructive actions can be configured to strictly require human consent. HEED provides `BOUND_APPROVAL` capabilities. When human oversight is triggered, HEED does not just flip a boolean flag. It creates an `ApprovalBinding` that hashes the exact arguments, provenance, and destination. The approval cannot be reused or mutated.

### Agentic Action Consequences
HEED operates on the philosophy of evaluating **consequences**, not reasoning. HEED evaluates:
```text
Agent Intent → External Effect
```
If a prompt injection successfully tricks the agent, the downstream action (e.g., dropping a database) still hits the HEED gateway and is evaluated objectively against policy.

---

## 2. OWASP Top 10 for LLM Applications

### Prompt Injection
HEED **does not prevent prompt injection**. Instead, HEED mitigates the *impact* of a successful prompt injection by ensuring the runtime policy boundary still applies. A malicious instruction that forces the agent to attempt an unauthorized network write will result in a `BLOCK`.

### Sensitive Information Disclosure
HEED handles this via Information Flow Control (IFC). Data returned from tools can be tagged with provenance labels (e.g., `PII`, `SECRET`). The `PolicyEvaluator` intercepts outbound actions and checks if the data's provenance is allowed to travel to the requested `destinationType` (e.g., `EXTERNAL_WEBHOOK`).

---

## 3. MITRE ATLAS

We reference MITRE ATLAS to model our adversarial scenarios. HEED mitigates specific tactics within the ATLAS framework related to action execution:

* **Command and Control (AML.T0005):** Mitigated by HEED's strict `Destination` evaluation and `external_network.write` capability constraints.
* **Exfiltration (AML.T0007):** Mitigated by Provenance tracing and Information Flow Control (IFC) policies blocking sensitive data from crossing external boundaries.
* **Abuse of AI-enabled systems:** Mitigated by HEED's `ContractEvaluator` blocking operations that drift outside the explicitly authorized objective.

---

## 4. NIST AI RMF

### GOVERN
HEED provides technical infrastructure to support organizational governance policies. Policies in HEED are versioned. When an execution starts, HEED captures an immutable `ExecutionPolicySnapshot`, ensuring that agents are governed by a stable rule set that cannot be quietly altered mid-execution by a rogue operator.

### MAP
HEED Maps trust boundaries explicitly by attaching rich context to every action:
* Agent identity
* Authority context (contracts)
* Provenance (data origin)
* Destination
* Trajectory (past actions)

This context mapping allows the `DecisionEngine` to evaluate the holistic risk of an action, rather than evaluating it in a vacuum.
