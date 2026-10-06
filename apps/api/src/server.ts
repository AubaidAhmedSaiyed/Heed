import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load .env automatically across monorepo directories
const candidateEnvPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "prisma/.env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../../../.env"),
  path.resolve(__dirname, "../../../prisma/.env")
];
for (const p of candidateEnvPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}

// Ensure DATABASE_URL is defined so PrismaClient never fails at startup
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:aubaid313@localhost:5432/rethen_dev";
}

import Fastify from "fastify";
import { RawActionRequest } from "@heed-ai/runtime";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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

// Global structured error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  const statusCode = error.statusCode || 500;
  
  if ((error as any).code === "P2002") {
    return reply.status(409).send({
      error: {
        code: "CONFLICT",
        message: "A resource with this identifier or unique property already exists"
      }
    });
  }
  if ((error as any).code === "P2025") {
    return reply.status(404).send({
      error: {
        code: "NOT_FOUND",
        message: "The requested resource was not found"
      }
    });
  }

  return reply.status(statusCode).send({
    error: {
      code: error.code || (statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "BAD_REQUEST"),
      message: error.message || "An unexpected error occurred"
    }
  });
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

// Authorization hook (Unified API Key & JWT)
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
    reply.code(401).send({ error: { code: "UNAUTHORIZED", message: "Missing Authorization header" } });
    return;
  }
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    reply.code(401).send({ error: { code: "UNAUTHORIZED", message: "Empty Bearer token" } });
    return;
  }

  // 1. Check if token is an API Key
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  try {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        OR: [
          { keyHash: hashedToken },
          { keyHash: token }
        ]
      }
    });

    if (apiKey) {
      if (apiKey.revokedAt) {
        reply.code(401).send({ error: { code: "REVOKED_API_KEY", message: "The provided HEED API key has been revoked." } });
        return;
      }
      (request as any).workspaceId = apiKey.workspaceId;
      (request as any).apiKeyId = apiKey.id;
      (request as any).authType = "apiKey";
      return;
    }
  } catch (err) {
    fastify.log.warn({ err }, "Database error during API key lookup");
  }

  // 2. Check if token is a Dashboard JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    (request as any).userId = decoded.userId;
    (request as any).authType = "jwt";

    // Skip workspace check for /me endpoint
    if (request.url === "/api/v1/auth/me") return;

    const requestedWorkspaceId = request.headers["x-workspace-id"] as string;
    if (requestedWorkspaceId) {
      const membership = await prisma.workspaceMembership.findUnique({
        where: { userId_workspaceId: { userId: decoded.userId, workspaceId: requestedWorkspaceId } }
      });

      if (!membership) {
        reply.code(403).send({ error: { code: "FORBIDDEN", message: "Forbidden: Not a member of this workspace" } });
        return;
      }

      (request as any).workspaceId = requestedWorkspaceId;
      return;
    } else {
      // Fallback to user's first workspace membership
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { memberships: true }
      });
      if (user && user.memberships.length > 0) {
        (request as any).workspaceId = user.memberships[0].workspaceId;
        return;
      }
      reply.code(403).send({ error: { code: "FORBIDDEN", message: "No active workspace membership found" } });
      return;
    }
  } catch (jwtErr) {
    // JWT verification failed
  }

  // 3. Fallback for local development if enabled
  if (process.env.NODE_ENV !== "production" && token === "dev-key") {
    (request as any).workspaceId = "default-workspace";
    return;
  }

  // 4. Deny access if neither API Key nor JWT passed
  reply.code(401).send({ error: { code: "UNAUTHORIZED", message: "Invalid or expired authorization credentials" } });
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

fastify.post("/api/v1/auth/signup", async (request, reply) => {
  const { email, password, name } = (request.body as any) || {};
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return reply.code(400).send({ error: { code: "INVALID_EMAIL", message: "A valid email address is required" } });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return reply.code(400).send({ error: { code: "WEAK_PASSWORD", message: "Password must be at least 8 characters long" } });
  }
  
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return reply.code(409).send({ error: { code: "EMAIL_EXISTS", message: "An account with this email address already exists" } });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const workspaceName = `${name?.trim() || "My"} Workspace`;
  
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name: name?.trim() || null,
      memberships: {
        create: {
          role: "ADMIN",
          workspace: {
            create: { name: workspaceName }
          }
        }
      }
    },
    include: { memberships: { include: { workspace: true } } }
  });

  const defaultWorkspace = user.memberships[0].workspace;

  // Initialize a baseline policy for the new workspace so runtime governance is active immediately
  await prisma.policy.create({
    data: {
      name: "Default Security Baseline",
      description: "Standard guardrails preventing unauthorized filesystem writes and requiring human approval for outbound changes",
      workspaceId: defaultWorkspace.id,
      versions: {
        create: {
          version: 1,
          status: "PUBLISHED",
          priority: 100,
          flowRules: [],
          noGoPatterns: [],
          forbiddenCapabilities: ["fs.write_file"],
          boundApprovalCapabilities: ["repository.write", "external_network.write"],
          policyHash: "baseline-sha256-default"
        }
      }
    }
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

  reply.send({
    token,
    user: { id: user.id, email: user.email, name: user.name },
    defaultWorkspace,
    workspaces: [defaultWorkspace]
  });
});

fastify.post("/api/v1/auth/login", async (request, reply) => {
  const { email, password } = (request.body as any) || {};
  if (!email || !password) {
    return reply.code(400).send({ error: { code: "BAD_REQUEST", message: "Email and password are required" } });
  }

  const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { memberships: { include: { workspace: true } } }
  });
  if (!user) {
    return reply.code(401).send({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return reply.code(401).send({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  const workspaces = user.memberships.map((m) => m.workspace);
  const defaultWorkspace = workspaces[0] || null;

  reply.send({
    token,
    user: { id: user.id, email: user.email, name: user.name },
    defaultWorkspace,
    workspaces
  });
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
  const workspaceId = (request as any).workspaceId;
  const keys = await prisma.apiKey.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" }
  });

  return keys.map((k) => ({
    id: k.id,
    name: k.name,
    prefix: `heed_live_••••${k.keyHash ? k.keyHash.slice(-4) : ""}`,
    createdAt: k.createdAt,
    revokedAt: k.revokedAt,
    workspaceId: k.workspaceId
  }));
});

fastify.post("/api/v1/api-keys", async (request, reply) => {
  const { name } = (request.body as any) || {};
  const workspaceId = (request as any).workspaceId;
  if (!workspaceId) {
    return reply.code(400).send({ error: { code: "BAD_REQUEST", message: "Missing workspace context" } });
  }

  const rawKey = `heed_live_${crypto.randomBytes(24).toString("hex")}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const prefix = `heed_live_••••${rawKey.slice(-4)}`;

  const apiKey = await prisma.apiKey.create({
    data: {
      name: (name && typeof name === "string" && name.trim()) ? name.trim() : "Default API Key",
      keyHash,
      workspaceId
    }
  });

  return {
    id: apiKey.id,
    name: apiKey.name,
    prefix,
    createdAt: apiKey.createdAt,
    key: rawKey // ONLY returned on creation!
  };
});

fastify.delete("/api/v1/api-keys/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const workspaceId = (request as any).workspaceId;
  const key = await prisma.apiKey.findFirst({ where: { id, workspaceId } });
  if (!key) return reply.code(404).send({ error: { code: "NOT_FOUND", message: "API key not found" } });
  
  await prisma.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() }
  });
  return { success: true, message: "API key revoked successfully" };
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
  const agentIdentifier = (request.headers["x-agent-id"] as string) || "default-agent";
  const workspaceId = (request as any).workspaceId || "default-workspace";

  let agent = await prisma.agent.findFirst({
    where: {
      OR: [
        { id: agentIdentifier, workspaceId },
        { name: agentIdentifier, workspaceId }
      ]
    }
  });

  if (!agent) {
    agent = await prisma.agent.create({
      data: {
        name: agentIdentifier,
        workspaceId
      }
    });
  }

  const execution = await prisma.execution.create({
    data: {
      agentId: agent.id,
      objective: objective || "Direct SDK Execution",
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
    fastify.log.error({ err: error }, "Database connection failed during healthcheck");
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
