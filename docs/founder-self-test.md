# Founder Manual Verification Guide

This guide provides exact steps to manually operate the HEED platform as a customer onboarding an external agent, validating the full E2E journey.

## Prerequisites
- Node.js (v18+)
- PostgreSQL database running locally (or via Docker)
- Ensure `.env` contains `DATABASE_URL`
- Provide a minimum-permission GitHub PAT via `$env:GITHUB_TOKEN` before starting.

## Step 1: Start the Platform
Run the following commands in the root of the repository:
```bash
npx prisma generate
npm run build
```
Then, start the backend and frontend in separate terminal windows:
```bash
# Terminal 1 (Backend)
npm run dev --workspace=api

# Terminal 2 (Frontend)
npm run dev --workspace=web
```

## Step 2: Customer Signup & Workspace Configuration
1. Open your browser and navigate to `http://localhost:5173/signup`.
2. Register a new account (e.g. `founder@heed.dev`).
3. You will be redirected to the Dashboard `http://localhost:5173/app/dashboard`.
4. A default Workspace is automatically generated.
- `[ ]` **Verification**: Ensure the Dashboard loads and displays your Workspace ID.

## Step 3: API Key Generation
1. Navigate to **API Keys** in the dashboard sidebar.
2. Click **Create API Key**, name it "Test External Agent".
3. Copy the resulting plain-text secret. Note that it will never be displayed again.
- `[ ]` **Verification**: Ensure the API Key is generated and listed in the table.

## Step 4: Policy Configuration
1. Navigate to **Policies** in the dashboard.
2. Create a Policy named "Strict Firewall".
3. In the Policy editor, configure:
   - **Forbidden Capabilities**: `file.write`
   - **Bounded Capabilities**: `issue.write`
- `[ ]` **Verification**: Ensure the Policy is saved and active.

## Step 5: External SDK Execution
Open a 3rd terminal to simulate your independent application. We will use the provided test consumer.
```bash
cd tests/external-agent-consumer
npm install
```
Export your API key:
```bash
# Windows PowerShell
$env:HEED_API_KEY="<YOUR_COPIED_API_KEY>"
```

### 1. Test OBSERVE (or ALLOW)
Run the consumer in `allow` mode (executes `github.read_pull_request`):
```bash
npx tsx consumer.ts allow
```
- `[ ]` **Expected Result**: Consumer prints that the action passed the security boundary and reached the connector.
- `[ ]` **Dashboard Verification**: Navigate to **Executions** in the UI. Ensure the execution appears and the Action event is marked as `ALLOWED`.

### 2. Test BLOCK
Run the consumer in `block` mode (executes `fs.write_file`):
```bash
npx tsx consumer.ts block
```
- `[ ]` **Expected Result**: Consumer throws a `HeedError` with `Decision: BLOCK`.
- `[ ]` **Dashboard Verification**: Check the execution audit log to see a `BLOCK` decision explicitly targeting `file.write`.

### 3. Test ASK & Human Approval
Run the consumer in `ask` mode (executes `github.create_issue`):
```bash
npx tsx consumer.ts ask
```
The terminal will pause and wait.
1. Navigate to **Interventions** in the Dashboard.
2. You will see a `PENDING` intervention for the GitHub issue creation.
3. Click **Approve (ALLOW_ONCE)**.
- `[ ]` **Expected Result**: The terminal resumes execution and the consumer script finishes.
- `[ ]` **Dashboard Verification**: The intervention moves to `RESOLVED`, and the execution concludes successfully. Check your GitHub repository to independently verify the issue was created!

### 4. Test API Key Revocation
1. Navigate back to **API Keys** in the dashboard.
2. Delete the API Key.
3. Re-run `npx tsx consumer.ts allow`.
- `[ ]` **Expected Result**: Consumer fails instantly with a 401 Unauthorized error.

## Safe Cleanup
- Delete the generated GitHub Issue from your test repository.
- Stop all terminal processes (`Ctrl+C`).
- If you used a real PAT for testing, consider revoking it in GitHub Developer Settings if this was purely an ephemeral test.
