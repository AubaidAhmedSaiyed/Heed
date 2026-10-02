# External Agent Readiness Audit

## Overview
This audit assesses the HEED platform's capability to support an external customer's independent AI agent utilizing the `@heed-ai/runtime` SDK. It separates what structurally works from what was specific to internal test mocks.

## Findings

### 1. SDK Packaging & Export Boundary
- **Current Behavior**: The `@heed-ai/runtime` SDK successfully exposes a `Heed` class, allowing external customers to register agents, establish executions, and evaluate actions via `heed.execute()` and `heed.wrapTool()`.
- **Finding**: The package boundary is intact. A clean external consumer can install the packed `tgz` and authenticate successfully without needing internal HEED types.

### 2. Runtime Workspace Context Security (Fixed)
- **Previous Behavior**: Internal routing handlers extracted API keys but the core `RuntimeGateway` did not rigorously enforce `workspaceId` downstream, leaving a regression gap.
- **Finding**: The architecture has been refactored so `workspaceId` flows natively through the entire decision engine and database layer. Clients cannot bypass their authenticated workspace, even if they inject spoofed `workspaceId` JSON payloads.

### 3. Agent Identity & Registration
- **Current Behavior**: SDK consumers initialize the `Heed` class with a string `agentId`. Upon the first `createExecution`, HEED registers this agent to the authenticated workspace if it doesn't already exist.
- **Finding**: This is functionally correct. HEED does not need to orchestrate or build the agent; merely identifying it via an arbitrary customer-provided string is sufficient for binding policies.

### 4. Human Approval Workflow (ASK)
- **Current Behavior**: The `DecisionEngine` successfully evaluates bounds and yields an `ASK` decision, generating a `PENDING` intervention in the Prisma database.
- **Finding**: The dashboard endpoints correctly poll Prisma for these interventions, allowing human operators to issue an `ALLOW_ONCE` or `BLOCK` resolution.

### 5. Exactly-Once Connector Execution & Concurrency
- **Previous Behavior**: The `InterventionManager` previously used an in-memory Map which lacked horizontal scaling and allowed concurrent REST resolutions to potentially fire duplicate side-effects.
- **Finding**: The architecture now strictly leverages Prisma `updateMany` conditions to enforce atomic intervention resolution. The SDK leverages client-provided `idempotencyKey` strings to prevent accidental retries from duplicating connector executions (at-most-once delivery). 

### 6. External Connector Execution
- **Current Behavior**: The platform hands off `ALLOWED` execution requests directly to external connectors (e.g. `github`).
- **Finding**: While structurally sound, full independent verification of external side effects (e.g. independently querying GitHub) is currently blocked by the absence of a live `$env:GITHUB_TOKEN`. The platform behaves correctly by yielding `502 Bad Credentials` from the external integration.

## Conclusion
The repository genuinely operates as a detached runtime control plane for independent consumer agents. The architectural boundary enforces execution scope entirely through explicit REST + API-Key authentication pathways, rather than local function calls or shared process memory.
