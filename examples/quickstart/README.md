# HEED Quickstart

Welcome to HEED. This quickstart demonstrates how to securely route your AI Agent's external actions through the HEED runtime control layer.

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials if running against a remote control plane.
   ```sh
   cp .env.example .env
   ```
2. Make sure HEED is running locally on port 4000 (if testing locally).
3. Run the quickstart!
   ```sh
   npx tsx index.ts
   ```

## What This Demonstrates

This application acts as an AI agent attempting to mutate state on GitHub.
It initializes the `@heed-ai/runtime` SDK and executes actions that simulate three common evaluation states:

1. **ALLOW**: The agent successfully issues a harmless action, and the SDK transparently passes back the execution payload from GitHub.
2. **BLOCK**: The agent attempts to access a restricted capability/resource. The SDK raises a developer-friendly `HeedError` explaining the rejection, and the external side-effect is securely aborted.
3. **ASK**: The agent issues an action bound by a dynamic runtime policy that demands Human Approval. The execution hangs until the human resolves the intervention on the control plane, at which point the SDK correctly surfaces the result.

Explore `index.ts` to see how minimal the integration is.
