import assert from "assert";

const API_URL = "http://localhost:4000/api";
const DASH_URL = "http://localhost:4000/api/v1";

async function fetcher(url: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Request failed: ${res.status} ${res.statusText} - ${errorText}`);
  }
  return res.json();
}

async function registerTenant(email: string, name: string) {
  const res = await fetcher(`${DASH_URL}/auth/signup`, {
    method: "POST",
    body: JSON.stringify({ email, password: "password123", name })
  });
  return { token: res.token, workspace: res.defaultWorkspace };
}

async function createApiKey(jwt: string, workspaceId: string, name: string) {
  const res = await fetcher(`${DASH_URL}/api-keys`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, "x-workspace-id": workspaceId },
    body: JSON.stringify({ name })
  });
  return res.key;
}

async function startExecution(apiKey: string, agentId: string) {
  const res = await fetcher(`${API_URL}/executions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "x-agent-id": agentId },
    body: JSON.stringify({
      objective: "Test objective",
      contract: { allowedSystems: ["http"] }
    })
  });
  return res.id;
}

async function sendAction(apiKey: string, executionId: string) {
  const res = await fetch(`${API_URL}/executions/${executionId}/actions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      idempotencyKey: `test-${Math.random()}`,
      action: {
        system: "http",
        operation: "get",
        arguments: { url: "https://example.com" }
      }
    })
  });
  // Can be 200 or 403 (if blocked). But it will exist.
  return res;
}

async function getDashboardExecutions(jwt: string, workspaceId: string) {
  return fetcher(`${DASH_URL}/executions`, {
    headers: { Authorization: `Bearer ${jwt}`, "x-workspace-id": workspaceId }
  });
}

async function runE2E() {
  console.log("Starting Multi-Tenant End-to-End Verification...");
  
  // 1. Setup Tenant A
  console.log("Registering Tenant A...");
  const tenantA = await registerTenant(`tenanta_${Date.now()}@heed.dev`, "Tenant A");
  console.log("Creating API Key for Tenant A...");
  const apiKeyA = await createApiKey(tenantA.token, tenantA.workspace.id, "Key A");
  
  // 2. Setup Tenant B
  console.log("Registering Tenant B...");
  const tenantB = await registerTenant(`tenantb_${Date.now()}@heed.dev`, "Tenant B");
  console.log("Creating API Key for Tenant B...");
  const apiKeyB = await createApiKey(tenantB.token, tenantB.workspace.id, "Key B");
  
  // 3. Executions
  console.log("Starting execution for Tenant A...");
  const execA = await startExecution(apiKeyA, "agent-a");
  await sendAction(apiKeyA, execA);
  
  console.log("Starting execution for Tenant B...");
  const execB = await startExecution(apiKeyB, "agent-b");
  await sendAction(apiKeyB, execB);
  
  // 4. Verification
  console.log("Verifying isolation via dashboard APIs...");
  const executionsA = await getDashboardExecutions(tenantA.token, tenantA.workspace.id);
  const executionsB = await getDashboardExecutions(tenantB.token, tenantB.workspace.id);
  
  // Assert Tenant A sees only Exec A
  assert.ok(executionsA.find((e: any) => e.id === execA), "Tenant A missing their execution");
  assert.ok(!executionsA.find((e: any) => e.id === execB), "Tenant A sees Tenant B's execution!");
  
  // Assert Tenant B sees only Exec B
  assert.ok(executionsB.find((e: any) => e.id === execB), "Tenant B missing their execution");
  assert.ok(!executionsB.find((e: any) => e.id === execA), "Tenant B sees Tenant A's execution!");
  
  // 5. Hard Authorization Check
  console.log("Verifying IDOR protection...");
  const fetchB = await fetch(`${DASH_URL}/executions/${execA}`, {
    headers: { Authorization: `Bearer ${tenantB.token}`, "x-workspace-id": tenantB.workspace.id }
  });
  assert.strictEqual(fetchB.status, 404, "Tenant B should get 404 when querying Tenant A's execution");
  
  console.log("✅ All multi-tenant isolation tests passed successfully.");
}

runE2E().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
