import Fastify from "fastify";
import { RawActionRequest } from "@heed-ai/runtime";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// In a real app we'd inject these from a DI container
import { RuntimeGateway } from "./runtime/RuntimeGateway";
import { ActionNormalizer } from "./actions/ActionNormalizer";
import { DecisionEngine } from "./trajectory/DecisionEngine";
import { ConnectorManager, GitHubConnector, FileSystemSimulator, HttpSimulator, HttpConnector } from "@heed/connectors";
import { EventStore } from "./events/EventStore";
import { ContractEvaluator } from "./trajectory/evaluators/ContractEvaluator";
import { SensitivityEvaluator } from "./trajectory/evaluators/SensitivityEvaluator";
import { TrajectoryEvaluator } from "./trajectory/evaluators/TrajectoryEvaluator";
import { BehaviorEvaluator } from "./trajectory/evaluators/BehaviorEvaluator";
import { CapabilityEvaluator } from "./trajectory/evaluators/CapabilityEvaluator";
import { PolicyEvaluator } from "./trajectory/evaluators/PolicyEvaluator";
import { PrismaClient } from "@prisma/client";
import { InterventionManager } from "./interventions/InterventionManager";

const prisma = new PrismaClient();
const fastify = Fastify({ logger: true });

import cors from '@fastify/cors';
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
fastify.register(cors, { 
  origin: allowedOrigin
});

// Setup dependencies
const normalizer = new ActionNormalizer();
const eventStore = new EventStore(prisma);
const trajectoryEngine = new DecisionEngine();
export const interventionManager = new InterventionManager(prisma);

trajectoryEngine.register(new ContractEvaluator());
trajectoryEngine.register(new PolicyEvaluator());
trajectoryEngine.register(new SensitivityEvaluator());
trajectoryEngine.register(new TrajectoryEvaluator());
trajectoryEngine.register(new BehaviorEvaluator());
trajectoryEngine.register(new CapabilityEvaluator());

const connectorManager = new ConnectorManager();
connectorManager.register(new GitHubConnector());
connectorManager.register(new HttpConnector());
connectorManager.register(new FileSystemSimulator());
connectorManager.register(new HttpSimulator());

const runtimeGateway = new RuntimeGateway({
  normalizer,
  trajectoryEngine,
  connectorManager,
  eventStore,
  interventionManager,
  prisma
});

const JWT_SECRET = process.env.JWT_SECRET || "heed-dev-jwt-secret-do-not-use-in-prod";

// Authorization hook
fastify.addHook("preHandler", async (request, reply) => {
  if (
    request.url.startsWith("/health") || 
    request.url.startsWith("/api/v1/auth/signup") || 
    request.url.startsWith("/api/v1/auth/login")
  ) {
    return;
  }

  const authHeader = request.headers.authorization;
  if (!authHeader) {
    reply.code(401).send({ error: "Unauthorized: Missing Authorization Header" });
    return;
  }
  const token = authHeader.replace("Bearer ", "").trim();

  // Route classification
  const isRuntimeRoute = request.url.includes("/actions") || request.url.includes("/executions") || request.url.includes("/resolve");
  const isDashboardRoute = request.url.startsWith("/api/v1/") && !request.url.startsWith("/api/v1/auth/");

  if (isRuntimeRoute && !request.url.startsWith("/api/v1/")) {
    // RUNTIME / API KEY Auth
    try {
      const apiKey = await prisma.apiKey.findUnique({ where: { keyHash: token } });
      if (!apiKey) {
        reply.code(401).send({ error: "Unauthorized: Invalid API Key" });
        return;
      }
      (request as any).workspaceId = apiKey.workspaceId;
    } catch(e) {
      if (token !== "dev-key") {
        reply.code(401).send({ error: "Unauthorized: Invalid API Key" });
        return;
      }
      (request as any).workspaceId = "default-workspace";
    }
  } else if (isDashboardRoute || (isRuntimeRoute && request.url.startsWith("/api/v1/"))) {
    // DASHBOARD / JWT Auth
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      (request as any).userId = decoded.userId;

      // Skip workspace check for /me
      if (request.url === "/api/v1/auth/me") return;

      const requestedWorkspaceId = request.headers["x-workspace-id"] as string;
      if (!requestedWorkspaceId) {
        reply.code(400).send({ error: "Missing x-workspace-id header" });
        return;
      }

      const membership = await prisma.workspaceMembership.findUnique({
        where: { userId_workspaceId: { userId: decoded.userId, workspaceId: requestedWorkspaceId } }
      });

      if (!membership) {
        reply.code(403).send({ error: "Forbidden: Not a member of this workspace" });
        return;
      }

      (request as any).workspaceId = requestedWorkspaceId;
    } catch (e) {
      reply.code(401).send({ error: "Unauthorized: Invalid JWT token" });
      return;
    }
  }
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

fastify.post("/api/v1/auth/signup", async (request, reply) => {
  const { email, password, name } = request.body as any;
  if (!email || !password) return reply.code(400).send({ error: "Email and password required" });
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return reply.code(400).send({ error: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      memberships: {
        create: {
          role: "ADMIN",
          workspace: {
            create: { name: `${name || "My"} Workspace` }
          }
        }
      }
    },
    include: { memberships: { include: { workspace: true } } }
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  const defaultWorkspace = user.memberships[0].workspace;

  reply.send({ token, user: { id: user.id, email: user.email, name: user.name }, defaultWorkspace });
});

fastify.post("/api/v1/auth/login", async (request, reply) => {
  const { email, password } = request.body as any;
  if (!email || !password) return reply.code(400).send({ error: "Email and password required" });

  const user = await prisma.user.findUnique({ where: { email }, include: { memberships: { include: { workspace: true } } } });
  if (!user) return reply.code(401).send({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return reply.code(401).send({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  reply.send({ token, user: { id: user.id, email: user.email, name: user.name }, workspaces: user.memberships.map(m => m.workspace) });
});

fastify.get("/api/v1/auth/me", async (request, reply) => {
  const userId = (request as any).userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { memberships: { include: { workspace: true } } }
  });
  if (!user) return reply.code(404).send({ error: "User not found" });

  reply.send({
    user: { id: user.id, email: user.email, name: user.name },
    workspaces: user.memberships.map(m => m.workspace)
  });
});

// ==========================================
// DASHBOARD V1 ROUTES (Multi-Tenant)
// ==========================================

import { MetricsService } from "./api/MetricsService";
const metricsService = new MetricsService(prisma);

fastify.get("/api/v1/overview", async (request) => {
  return metricsService.getOverview((request as any).workspaceId);
});

fastify.get("/api/v1/agents", async (request) => {
  return metricsService.getAgents((request as any).workspaceId);
});

fastify.post("/api/v1/agents", async (request, reply) => {
  const workspaceId = (request as any).workspaceId;
  const { name, description } = request.body as any;
  const agent = await prisma.agent.create({
    data: { name, description, workspaceId }
  });
  return agent;
});

fastify.get("/api/v1/agents/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const data = await metricsService.getAgentDetail((request as any).workspaceId, id);
  if (!data) return reply.code(404).send({ error: "Agent not found" });
  return data;
});

fastify.get("/api/v1/executions", async (request) => {
  return metricsService.getExecutions((request as any).workspaceId);
});

import { ExecutionGraphService } from "./graph/ExecutionGraphService";
const graphService = new ExecutionGraphService(prisma);

fastify.get("/api/v1/executions/:id", async (request, reply) => {
  const { id: executionId } = request.params as { id: string };
  const workspaceId = (request as any).workspaceId;
  
  const execution = await prisma.execution.findFirst({
    where: { id: executionId, agent: { workspaceId } }
  });
  if (!execution) return reply.code(404).send({ error: "Execution not found" });

  try {
    const graph = await graphService.getExecutionGraph(executionId);
    return graph;
  } catch (e: any) {
    reply.code(404).send({ error: e.message });
  }
});

fastify.get("/api/v1/policies", async (request) => {
  return prisma.policy.findMany({ 
    where: { workspaceId: (request as any).workspaceId },
    include: { versions: true } 
  });
});

fastify.post("/api/v1/policies", async (request, reply) => {
  const data = request.body as any;
  const workspaceId = (request as any).workspaceId;
  const policy = await prisma.policy.create({
    data: {
      name: data.name,
      description: data.description,
      workspaceId,
      versions: {
        create: {
          version: 1,
          status: "PUBLISHED",
          priority: data.priority || 100,
          flowRules: data.flowRules || [],
          noGoPatterns: data.noGoPatterns || [],
          forbiddenCapabilities: data.forbiddenCapabilities || [],
          boundApprovalCapabilities: data.boundApprovalCapabilities || [],
          policyHash: "initial-hash-placeholder"
        }
      }
    }
  });
  reply.send(policy);
});

fastify.get("/api/v1/api-keys", async (request) => {
  return prisma.apiKey.findMany({
    where: { workspaceId: (request as any).workspaceId },
    orderBy: { createdAt: "desc" }
  });
});

fastify.post("/api/v1/api-keys", async (request, reply) => {
  const { name } = request.body as any;
  const workspaceId = (request as any).workspaceId;
  // In a real app we'd hash the token and only return the raw value once.
  // For MVP we just use the raw value in the DB to keep it simple, mimicking what was already there.
  const rawKey = `heed_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  const apiKey = await prisma.apiKey.create({
    data: {
      name: name || "New API Key",
      keyHash: rawKey,
      workspaceId
    }
  });
  return { ...apiKey, key: rawKey }; // Return raw key once
});

fastify.delete("/api/v1/api-keys/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const workspaceId = (request as any).workspaceId;
  const key = await prisma.apiKey.findFirst({ where: { id, workspaceId } });
  if (!key) return reply.code(404).send({ error: "Key not found" });
  
  await prisma.apiKey.delete({ where: { id } });
  return { success: true };
});

fastify.get("/api/v1/interventions", async (request, reply) => {
  const workspaceId = (request as any).workspaceId;
  const interventions = await prisma.intervention.findMany({
    where: { execution: { agent: { workspaceId } } },
    include: {
      actionEvent: { select: { capability: true, resource: true, system: true, operation: true, approval: true } },
      execution: { select: { objective: true, agent: { select: { name: true } } } }
    },
    orderBy: { createdAt: "desc" }
  });
  return interventions;
});

fastify.post("/api/v1/interventions/:id/resolve", async (request: any, reply) => {
  const { id } = request.params;
  const { decision } = request.body;
  const workspaceId = request.workspaceId;

  const intervention = await prisma.intervention.findFirst({
    where: { id, execution: { agent: { workspaceId } } }
  });

  if (!intervention) return reply.code(404).send({ error: "Intervention not found" });

  try {
    const result = await interventionManager.resolveIntervention(id, decision);
    return { success: true, intervention: result };
  } catch (e: any) {
    reply.code(400).send({ error: e.message });
  }
});

fastify.get("/api/v1/events", async (request) => {
  const query = request.query as any;
  const includePayload = query.includePayload === 'true' || query.includePayload === true;
  const workspaceId = (request as any).workspaceId;

  return prisma.event.findMany({
    where: { execution: { agent: { workspaceId } } },
    orderBy: { timestamp: 'desc' },
    select: {
      id: true,
      executionId: true,
      type: true,
      timestamp: true,
      previousEventHash: true,
      currentEventHash: true,
      payload: includePayload
    }
  });
});

fastify.get("/api/v1/connectors", async (request) => {
  const workspaceId = (request as any).workspaceId;
  const connectors = await prisma.connector.findMany({ where: { workspaceId } });
  
  // Mix in standard system connectors
  return [
    { id: 'http', name: 'HTTP', status: 'Available', capabilities: ['external_network.write', 'external_network.read'] },
    { id: 'github', name: 'GitHub', status: 'Configured', capabilities: ['repository.read', 'repository.write'] },
    { id: 'fs-sim', name: 'FileSystem Simulator', status: 'Available', capabilities: ['file.read', 'file.write'] },
    ...connectors
  ];
});

fastify.get("/api/v1/provenance", async (request) => {
  const workspaceId = (request as any).workspaceId;
  const actions = await prisma.actionEvent.findMany({
    where: { execution: { agent: { workspaceId } } },
    include: { decision: true },
    orderBy: { timestamp: 'desc' }
  });

  const withProvenance = actions.filter(a => a.provenanceLabels && a.provenanceLabels.length > 0);

  return withProvenance.map(a => ({
    source: a.provenanceSource || a.provenanceLabels.join(", "),
    destination: a.destinationIdentifier || a.destinationType || a.system,
    decision: a.decision?.decision || a.status,
    actionId: a.id,
    timestamp: a.timestamp
  }));
});

// ==========================================
// RUNTIME LEGACY V1 ROUTES (Backwards Compatible for SDK)
// ==========================================

fastify.post("/api/executions", async (request, reply) => {
  const { objective, contract, authority } = request.body as any;
  const agentId = request.headers["x-agent-id"] as string || "unknown-agent";
  const workspaceId = (request as any).workspaceId || "default-workspace";

  const existingAgent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (existingAgent && existingAgent.workspaceId !== workspaceId) {
    return reply.status(403).send({ error: "Agent ID belongs to a different workspace" });
  }

  await prisma.agent.upsert({
    where: { id: agentId },
    update: {}, // Do NOT update workspaceId
    create: { id: agentId, name: agentId, workspaceId }
  });

  const execution = await prisma.execution.create({
    data: {
      agentId,
      objective,
      authorityType: authority?.type,
      authorityId: authority?.id,
      status: "CREATED"
    }
  });

  const activeVersions = await prisma.policyVersion.findMany({
    where: { status: "PUBLISHED", policy: { workspaceId } }
  });
  
  if (activeVersions.length > 0) {
    await prisma.executionPolicySnapshot.createMany({
      data: activeVersions.map(v => ({
        executionId: execution.id,
        policyVersionId: v.id
      }))
    });
  }

  if (contract) {
    await prisma.executionContract.create({
      data: {
        executionId: execution.id,
        objective: contract.objective || objective,
        expectedActions: contract.expectedActions || [],
        allowedSystems: contract.allowedSystems || [],
        allowedCapabilities: contract.allowedCapabilities || [],
        restrictedResources: contract.restrictedResources || [],
        forbiddenCapabilities: contract.forbiddenCapabilities || [],
        forbiddenResourcePatterns: contract.forbiddenResourcePatterns || [],
        forbiddenProvenance: contract.forbiddenProvenance || [],
        flowRules: contract.flowRules || [],
        noGoPatterns: contract.noGoPatterns || [],
        terminationConditions: contract.terminationConditions || []
      }
    });
  }
  
  reply.send({ id: execution.id });
});

fastify.post("/api/executions/:id/actions", async (request, reply) => {
  const { id: executionId } = request.params as { id: string };
  const rawAction = request.body as RawActionRequest;
  const workspaceId = (request as any).workspaceId;

  const execution = await prisma.execution.findFirst({
    where: { id: executionId, agent: { workspaceId } }
  });

  if (!execution) {
    return reply.status(404).send({ error: "Execution not found or not in workspace" });
  }

  try {
    const result = await runtimeGateway.processActionRequest(workspaceId, executionId, rawAction);
    reply.send(result);
  } catch (error: any) {
    console.error("[SERVER] Action Error:", error);
    if (error.decision) {
      reply.status(403).send({ 
        error: error.message, 
        decision: error.decision, 
        reasons: error.reasons || [] 
      });
    } else {
      reply.status(502).send({
        error: error.message,
        system: "connector_failure"
      });
    }
  }
});

fastify.get("/health", async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok", database: "connected" };
  } catch (error) {
    fastify.log.error("Database connection failed during healthcheck:", error);
    return { status: "error", database: "disconnected" };
  }
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`HEED API listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
