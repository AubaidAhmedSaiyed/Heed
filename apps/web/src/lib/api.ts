export function getApiBaseUrl(): string {
  const envUrl = 
    ((import.meta as any).env?.VITE_API_URL as string) ||
    ((import.meta as any).env?.VITE_API_BASE_URL as string);

  if (envUrl && typeof envUrl === 'string') {
    let clean = envUrl.trim().replace(/\/+$/, '');
    if (!clean.endsWith('/api/v1')) {
      clean = `${clean}/api/v1`;
    }
    return clean;
  }

  // In browser, if on localhost/127.0.0.1:
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:4000/api/v1';
  }

  // If in production and no env variable was set, default to same-origin /api/v1
  return '/api/v1';
}

export async function fetcher(endpoint: string, options: RequestInit = {}) {
  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const token = localStorage.getItem('heed_token');
  const workspaceId = localStorage.getItem('heed_active_workspace');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as any
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (workspaceId) headers['x-workspace-id'] = workspaceId;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (err: any) {
    throw new Error(`Unable to connect to HEED API at ${url}. Please verify your API service is running and accessible.`);
  }

  if (!response.ok) {
    let errMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const body = await response.json();
      if (body.error) {
        errMessage = typeof body.error === 'object' && body.error.message ? body.error.message : (typeof body.error === 'string' ? body.error : JSON.stringify(body.error));
      } else if (body.message) {
        errMessage = body.message;
      }
    } catch (_) {}
    throw new Error(errMessage);
  }
  return response.json();
}

export const api = {
  // Auth
  signup: (data: { email: string; password: string; name?: string }) => 
    fetcher('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) => 
    fetcher('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetcher('/auth/me'),

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
