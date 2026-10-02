# HEED SaaS Verification & Architecture Audit

## 1. Current Architecture Overview

The HEED platform has been transitioned from a single-tenant runtime enforcer into a multi-tenant SaaS application. The core application logic resides in a Fastify backend (`apps/api`) and a React frontend (`apps/web`). The backend handles telemetry ingestion, authentication, and policy enforcement via `RuntimeGateway` and `DecisionEngine`. It persists data to a PostgreSQL database using Prisma.

## 2. Authentication Model

The platform implements a split authentication paradigm to accommodate human operators on the dashboard and headless agents on the runtime SDK.

- **Dashboard Authentication (JWT)**: Human users interact with the dashboard via short-lived JWT tokens (signed with `JWT_SECRET`). The dashboard routes are scoped under `/api/v1/*` (except `/api/v1/auth/*`). The `preHandler` middleware validates the JWT and extracts the `userId`.
- **Runtime Authentication (API Key)**: Agents invoking the SDK authenticate using API keys. The SDK hits endpoints like `/api/executions` and `/api/executions/:id/actions`. The backend identifies the API key via `Bearer <key>`, looks up its associated workspace, and injects the `workspaceId` into the request.

## 3. Workspace Model & Resource Ownership

The tenancy boundary is the `Workspace`.
- `Workspace` is the root container for all platform resources.
- `User`s belong to workspaces through `WorkspaceMembership` (with roles like `ADMIN` or `MEMBER`).
- Every business entity (`Agent`, `Execution`, `ActionEvent`, `Policy`, `Connector`, `Intervention`, `ApiKey`) must trace ownership back to a `Workspace` directly or indirectly.
  - Direct ownership: `ApiKey`, `Agent`, `Policy`, `Connector`.
  - Indirect ownership: `Execution` (via `Agent`), `ActionEvent` (via `Execution`), `Intervention` (via `Execution`), `Decision` (via `ActionEvent`).

## 4. Runtime Authentication Flow

1. SDK consumer invokes `new Heed({ apiKey: "heed_live_..." })`.
2. SDK sends `POST /api/executions` with `Authorization: Bearer heed_live_...`
3. Backend `preHandler`:
   - Looks up `ApiKey` in database by `keyHash`.
   - Injects `workspaceId` into request.
4. Route handler creates an `Agent` and `Execution` explicitly associated with `workspaceId`.
5. Subsequent action requests (`/api/executions/:id/actions`) verify that the `Execution` belongs to the `workspaceId` assigned to the API Key before invoking the `RuntimeGateway`.

## 5. Defense-in-Depth Database Isolation Security

- **Assumption**: The frontend correctly sends `x-workspace-id` for JWT-based requests.
- **Security Posture**: The backend does *not* blindly trust `x-workspace-id`. It validates that the authenticated `userId` has a valid `WorkspaceMembership` for that `workspaceId`.
- **Database Query Isolation**:
  - `MetricsService` methods strictly include `where: { agent: { workspaceId } }` or `where: { workspaceId }`.
  - **VERIFIED**: The internal `RuntimeGateway`, `EventStore`, and `InterventionManager` were refactored to explicitly require `workspaceId` downstream. If a route controller forgets to evaluate `workspaceId`, the `RuntimeGateway` naturally rejects cross-tenant operations via Prisma schema limits.
  - **VERIFIED**: A client spoofing `{ "workspaceId": "tenant-b" }` inside a POST body fails because `(request as any).workspaceId` is immutable and injected strictly by the backend API key lookup middleware.

## 6. Real SaaS Lifecycle Evidence
- **VERIFIED**: Workspace creation, agent creation, and API Key generation endpoints behave functionally according to standard multi-tenant parameters.
- **VERIFIED**: Concurrency control via DB-level `updateMany` guarantees atomic intervention-claim handling (Exactly-Once processing).
- **VERIFIED**: API-Key revocation strictly results in 401 Unauthorized for the respective consumer SDKs.

## 7. Credential Exposure Incident Remediation

During prior testing, a raw GitHub Personal Access Token (PAT) was inadvertently provided in plain text and captured in `.system_generated` task logs.

**Remediation Steps Taken**:
- A repository-wide and artifact-wide scrub was executed to redact the PAT string `github_pat_*`.
- The token is considered compromised and MUST be manually revoked in GitHub by the owner.
- Environment variable injection is now mandatory for secrets. No plain text credentials will be printed in instructions or logs.
