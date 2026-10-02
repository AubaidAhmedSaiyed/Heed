# Approvals

HEED allows you to require human intervention before consequential actions execute. When an action matches a policy that yields an `ASK` decision, the execution pauses.

## Triggering Approvals
When `heed.execute()` returns an `ASK` decision, the Node.js promise pauses. A `PENDING` intervention is logged to the HEED Control Plane.

## Resolving Approvals
Human operators use the Control Plane to review the intervention.
- **ALLOW_ONCE**: The action proceeds. The original `heed.execute()` promise resolves successfully.
- **BLOCK**: The action is rejected. The original `heed.execute()` promise rejects with a `HeedError` (`Decision: BLOCK`).
- **TERMINATE_EXECUTION**: The entire execution is immediately halted. Subsequent `heed.execute()` calls for this execution will fail instantly.

## Concurrency
The HEED API enforces exactly-once approval handling using database-level locking. If multiple clients attempt to resolve the same intervention simultaneously, only the first request succeeds; subsequent requests are rejected, preventing duplicate side-effects.
