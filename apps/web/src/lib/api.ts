const API_URL = "http://localhost:4000/api";
const RUNTIME_URL = "http://localhost:4000";

const defaultHeaders = {
  "Content-Type": "application/json",
  "Authorization": "Bearer dev-key"
};

async function fetcher(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers }
  });

  if (!response.ok) {
    let errMessage = response.statusText;
    try {
      const body = await response.json();
      if (body.error) errMessage = body.error;
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

  // Provenance (we'll fetch from a new endpoint or query action events)
  getProvenance: () => fetcher("/provenance").catch(() => []),

  // Approvals (Interventions)
  getApprovals: () => fetcher(`${RUNTIME_URL}/interventions`),
  resolveApproval: (id: string, decision: string) => fetcher(`${RUNTIME_URL}/interventions/${id}/resolve`, { method: "POST", body: JSON.stringify({ decision }) }),

  // Agents
  getAgents: () => fetcher("/agents"),
  getAgent: (id: string) => fetcher(`/agents/${id}`),

  // Connectors
  getConnectors: () => fetcher("/connectors").catch(() => []),

  // Audit
  getEvents: () => fetcher("/events").catch(() => []),
};
