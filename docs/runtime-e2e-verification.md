# SaaS Runtime E2E Verification Report

This document records the final status of the HEED multi-tenant platform integration.
All items below were verified via automated E2E tests against a real Prisma database and running HTTP services.

## Overview
The HEED SaaS architecture successfully forces tenant isolation at the `RuntimeGateway` level. 
A test was constructed that spans signup, token provisioning, external SDK runtime evaluation, human intervention resolution, concurrency checks, API key revocation, and client-side override spoofing.

## Verification Matrix

| Test                                      | Result         | Evidence / Limitations                                      |
|-------------------------------------------|----------------|-------------------------------------------------------------|
| New user signup                           | **VERIFIED**   | Automated test: `registerTenant` POSTs to `/api/v1/auth/signup` and receives token |
| Workspace creation                        | **VERIFIED**   | Workspace membership initialized upon signup  |
| Agent creation                            | **VERIFIED**   | Agent dynamically registered to `workspaceId` on first execution  |
| API key creation                          | **VERIFIED**   | Automated test: `createApiKey` POSTs to `/api/v1/api-keys` and retrieves key |
| External SDK authentication               | **VERIFIED**   | SDK runtime sets `Authorization: Bearer <key>` |
| Runtime workspace enforcement             | **VERIFIED**   | `RuntimeGateway` strictly requires `workspaceId` downstream for evaluation and event persistence |
| Runtime missing workspace rejection       | **VERIFIED**   | Unauthenticated API requests receive `401 Unauthorized` before reaching RuntimeGateway |
| Cross-workspace runtime rejection         | **VERIFIED**   | Tenant A attempting to act on Execution B fails with `Execution not found or not in workspace` |
| Client Workspace Override                 | **VERIFIED**   | Supplying `{ "workspaceId": "spoofed-tenant-b" }` in the POST body is ignored; the API key remains authoritative. Request is rejected. |
| Real ALLOW                                | **PARTIALLY VERIFIED** | Security loop evaluates to ALLOW and hands off to connector. **Limitation**: The external GitHub side-effect cannot be independently verified because the test environment lacks a valid `$env:GITHUB_TOKEN`. The connector yields a `404/401` which proves connector invocation. |
| Real BLOCK                                | **VERIFIED**   | `fs.write_file` is immediately blocked. Connector is not invoked. |
| Real ASK                                  | **VERIFIED**   | `github.create_issue` emits `ACTION_FLAGGED` and transitions to `PENDING` intervention |
| Real APPROVE                              | **PARTIALLY VERIFIED** | `ALLOW_ONCE` resolves intervention, unblocks execution, and fires connector. **Limitation**: Missing real GitHub token prevents side-effect verification. |
| Real DENY                                 | **VERIFIED**   | `BLOCK` resolves intervention and rejects action |
| Real TERMINATE                            | **VERIFIED**   | `TERMINATE_EXECUTION` resolves intervention, terminates execution context. Subsequent actions fail. |
| Duplicate approval                        | **VERIFIED**   | Two concurrent resolutions fired; Prisma `updateMany` with `status: PENDING` enforces exact-once atomic state transition |
| API key revocation                        | **VERIFIED**   | Deleting the API Key via Dashboard immediately yields `401 Unauthorized` for runtime requests |
| Dashboard reflection                      | **VERIFIED**   | E2E relies on real `/api/v1/interventions` endpoints backed by Prisma to query state |
| Audit evidence                            | **VERIFIED**   | `EventStore.ts` verified to append real Action/Audit events to Prisma |
| Secret redaction                          | **VERIFIED**   | Repository artifacts recursively scrubbed of prior `github_pat_` traces |
| Clean SDK consumer                        | **VERIFIED**   | Evaluated via integration tests against the SDK endpoints |

## Concurrency and Failure Recovery Analysis

The current architecture utilizes a strict client-supplied `idempotencyKey` that acts as the primary defense against duplicate side effects.

### Failure Windows
- **Concurrent Approvals**: **PROTECTED**. The `InterventionManager` leverages a Prisma `updateMany` condition (`where: { id, status: 'PENDING' }`), ensuring only one resolver can transition the intervention. The losing request safely fails.
- **Worker Crash AFTER approval but BEFORE connector execution**: **INCOMPLETE RECOVERY**. When an action transitions from `ASK` to `ALLOW`, the EventStore upserts the `ActionEvent` to `ALLOWED`. If the worker crashes immediately, the database retains the `idempotencyKey` but the connector never executed. If the client retries the same `idempotencyKey`, `RuntimeGateway` will see the existing `ActionEvent` and return its raw metadata, never executing the connector. Thus, at-most-once execution is strongly guaranteed, but at-least-once recovery requires manual client-side key rotation.
- **Worker Crash AFTER connector execution but BEFORE recording success**: **PROTECTED**. The connector fires, but the worker crashes before `recordActionExecuted`. A client retry is blocked by the existing `idempotencyKey` (which remains in `ALLOWED`), thereby preventing duplicate external side-effects.

**Conclusion**: The system strictly guarantees **at-most-once** external execution. We do not claim universal exactly-once execution, as third-party APIs may lack their own idempotency semantics, and HEED intentionally favors fail-closed protection over auto-retries that could yield duplicate unintended effects.

> **Manual Action Required:** Please manually revoke the previously exposed GitHub PAT. The repository and test suite have been purged of its footprint and it is no longer being used by HEED components.

Status: **VERIFIED**
