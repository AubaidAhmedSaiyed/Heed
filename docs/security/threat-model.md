# HEED Threat Model

## System Boundary

HEED acts as an in-line authorization gateway between autonomous AI agents and external systems. The core boundary is defined around the `RuntimeGateway`:

```text
AI Agent
   ↓
@heed/runtime (SDK / interceptor)
   ↓
[ Trust Boundary ]
   ↓
Runtime Gateway (HEED Control Plane)
   ↓
Decision Engine
   ├── Policy Evaluator
   ├── Contract Evaluator
   ├── Capability Evaluator
   └── Trajectory Evaluator
   ↓
[ Approval Boundary ]
   ↓
Connector Manager
   ↓
External Tool / API
```

## Assets

The following core assets must be protected to ensure HEED's authorization boundaries:

1. **Execution Contracts:** Define the baseline capabilities an agent is allowed to use for a specific session.
2. **Policy Snapshots:** Immutable references to the policy rules active at the moment an execution begins.
3. **Approval Bindings:** Cryptographically bound tokens representing human consent for a specific action context (hash of arguments, provenance, destination).
4. **Provenance State:** Labels representing the origin and classification of data flowing through the system (e.g., `PII`, `SECRET`).
5. **Event Hash Chain (Audit):** Transactionally appended events that cryptographically link each runtime decision to the previous one, ensuring tamper-evident logging.
6. **Connector Credentials:** Secrets required to execute actions against external tools.

## Trust Boundaries

* **Agent vs. Runtime SDK:** The agent is considered untrusted. It may have been compromised or may be acting under malicious instruction. The SDK intercepts intent before side effects occur.
* **SDK vs. RuntimeGateway:** The SDK passes normalized intent to the Gateway. The Gateway does *not* blindly trust the SDK's decision-making but relies on the SDK to forward the raw execution context accurately.
* **Human Approval vs. Execution:** Human intervention decisions are processed securely out-of-band and verified at execution time to prevent the agent from spoofing approvals.

## Threat Actors & Scenarios

### 1. Compromised or Misbehaving Agent
An agent model that has been compromised via supply-chain attack or is hallucinating attempts to call dangerous tools outside its `ExecutionContract` bounds.

### 2. Malicious Instruction (Prompt Injection)
An agent receives an indirect prompt injection that convinces it to exfiltrate data or mutate infrastructure. HEED treats the *resulting tool action* as the threat surface.

### 3. Provenance Downgrade / Spoofing
An attacker attempts to relabel `SECRET` data as `PUBLIC` to bypass Information Flow Control (IFC) policies.

### 4. Approval Replay & Mutation
An attacker attempts to reuse an old human approval for a new destructive action, or modifies the arguments of an action after a human has approved it.

### 5. Policy Bypass
An attacker attempts to construct an action request that evades evaluation entirely or triggers a failure mode in the Gateway to fail-open.

## Security Objectives & Invariants

HEED enforces the following core invariants at runtime:

1. **No unauthorized tool execution:** Capability requests missing from the active execution contract are blocked.
2. **No prohibited information flow:** Data with restricted provenance cannot be sent to unauthorized destinations.
3. **No approval replay/mutation:** Human interventions are cryptographically bound to a single action context and consumed upon use.
4. **No fail-open authorization:** Database failures, missing policies, or misconfigurations result in a fail-closed (`BLOCK`) decision.
5. **Audit event integrity:** Execution events are chained via cryptographic hashes to ensure the trajectory is tamper-evident.
