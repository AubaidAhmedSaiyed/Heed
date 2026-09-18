# HEED Metrics & Observability

HEED provides deterministic agent intelligence based entirely on recorded `ActionEvent` data.

## Execution Metrics
At the execution level, HEED tracks:
- Total Actions
- Allowed, Blocked, and ASK (intervened) actions
- Trajectory path visualization
- Impact distribution (`HIGH`, `MEDIUM`, `LOW`)

## Agent Level Metrics
For each Agent (cross-execution), HEED aggregates:
- **Total Executions & Actions**
- **Decision Percentages** (e.g. 75% allowed, 10% blocked, 15% ASK)
- **Capability Usage**: Top requested capabilities (`repository.read`, `external_network.write`)
- **System Usage**: Top systems interacting with (`github`, `http`)

## Behavior Changes
Rather than using unpredictable Machine Learning models to detect "anomalies," HEED detects deterministic behavior changes. When an agent's trajectory violates established context constraints (causing `[CAPABILITY_ESCALATION]` or `[OBJECTIVE_DEVIATION]` events), these are automatically flagged in the UI as behavior changes that warrant developer review.

## Latency & Performance (Benchmark)
The Decision Engine evaluates context natively inside Node.js.
According to the built-in test harness (`apps/demo-agent/src/benchmark.ts`), the contextual evaluation engine performs at:
- **p50:** ~0.011 ms
- **p95:** ~0.108 ms
- **p99:** ~0.580 ms
(Latency measures decision logic only, excluding database I/O for `ActionEvent` persistence).
