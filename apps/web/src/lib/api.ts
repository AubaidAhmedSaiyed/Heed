const API_URL = ((import.meta as any).env?.VITE_API_URL as string) || "http://localhost:4000/api/v1";

async function fetcher(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  
  const token = localStorage.getItem('heed_token');
  const workspaceId = localStorage.getItem('heed_active_workspace');
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers as any
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (workspaceId) headers["x-workspace-id"] = workspaceId;

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errMessage = response.statusText;
    try {
      const body = await response.json();
      if (body.error) {
        errMessage = typeof body.error === "object" && body.error.message ? body.error.message : (typeof body.error === "string" ? body.error : JSON.stringify(body.error));
      } else if (body.message) {
        errMessage = body.message;
      }
    } catch (e) {}
    throw new Error(errMessage);
  }
  return response.json();
}

export const api = {
  // Overview
  getOverview: () => fetcher("/overview"),
  
  // Executions
  getExecutions: () => fetcher("/executions"),
  getExecution: (id: string) => fetcher(`/executions/${id}`),

  // Policies
  getPolicies: () => fetcher("/policies"),
  createPolicy: (data: any) => fetcher("/policies", { method: "POST", body: JSON.stringify(data) }),

  // Provenance
  getProvenance: () => fetcher("/provenance").catch(() => []),

  // Approvals (Interventions)
  getApprovals: () => fetcher(`/interventions`),
  resolveApproval: (id: string, decision: string) => fetcher(`/interventions/${id}/resolve`, { method: "POST", body: JSON.stringify({ decision }) }),

  // Agents
  getAgents: () => fetcher("/agents"),
  getAgent: (id: string) => fetcher(`/agents/${id}`),
  createAgent: (data: any) => fetcher("/agents", { method: "POST", body: JSON.stringify(data) }),

  // Connectors
  getConnectors: () => fetcher("/connectors").catch(() => []),

  // Audit
  getEvents: () => fetcher("/events").catch(() => []),

  // API Keys
  getApiKeys: () => fetcher("/api-keys"),
  createApiKey: (data: any) => fetcher("/api-keys", { method: "POST", body: JSON.stringify(data) }),
  revokeApiKey: (id: string) => fetcher(`/api-keys/${id}`, { method: "DELETE" }),
};
