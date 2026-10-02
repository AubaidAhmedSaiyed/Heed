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

async function run() {
  const res = await fetcher(`${DASH_URL}/auth/signup`, {
    method: "POST",
    body: JSON.stringify({ email: `consumer_${Date.now()}@heed.dev`, password: "password123", name: "Consumer Tenant" })
  });
  const { token, defaultWorkspace } = res;
  
  const keyRes = await fetcher(`${DASH_URL}/api-keys`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "x-workspace-id": defaultWorkspace.id },
    body: JSON.stringify({ name: "Consumer Key" })
  });

  await fetcher(`${DASH_URL}/policies`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "x-workspace-id": defaultWorkspace.id },
    body: JSON.stringify({
      name: "Consumer Policy",
      forbiddenCapabilities: ["file.write", "file.read"],
      boundApprovalCapabilities: ["issue.write"],
    })
  });

  console.log(keyRes.key);
}

run().catch(console.error);
