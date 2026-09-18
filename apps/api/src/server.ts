import Fastify from "fastify";
import { RawActionRequest } from "@heed/runtime";

// In a real app we'd inject these from a DI container
// but here we instantiate directly for the MVP
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
import { PrismaClient } from "@prisma/client";
import { InterventionManager } from "./interventions/InterventionManager";

const prisma = new PrismaClient();
const fastify = Fastify({ logger: true });

import cors from '@fastify/cors';
fastify.register(cors, { 
  origin: "*"
});

// Setup dependencies
const normalizer = new ActionNormalizer();
const eventStore = new EventStore(prisma);
const trajectoryEngine = new DecisionEngine();
export const interventionManager = new InterventionManager();

trajectoryEngine.register(new ContractEvaluator());
trajectoryEngine.register(new SensitivityEvaluator());
trajectoryEngine.register(new TrajectoryEvaluator());
trajectoryEngine.register(new BehaviorEvaluator());
trajectoryEngine.register(new CapabilityEvaluator());

const connectorManager = new ConnectorManager();
connectorManager.register(new GitHubConnector()); // Enabled real GitHub integration
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

// Simple API Key authentication (Phase 8: Simplify Authentication)
const HEED_API_KEY = process.env.HEED_API_KEY || "dev-key";

fastify.addHook("preHandler", async (request, reply) => {
  // Allow health and UI-bound endpoints (like interventions/graph) for simplicity in MVP demo
  if (request.url.startsWith("/health") || request.url.startsWith("/api/executions") && request.method === "GET" || request.url.startsWith("/interventions")) {
    return;
  }

  // Protect Action endpoints
  if (request.url.includes("/actions")) {
    const authHeader = request.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${HEED_API_KEY}`) {
      reply.code(401).send({ error: "Unauthorized: Invalid or missing API Key" });
      return;
    }
  }
});

// Setup API Routes
fastify.post("/api/executions/:id/actions", async (request, reply) => {
  const { id: executionId } = request.params as { id: string };
  const rawAction = request.body as RawActionRequest;

  try {
    const result = await runtimeGateway.processActionRequest(executionId, rawAction);
    reply.send(result);
  } catch (error: any) {
    reply.status(403).send({ 
      error: error.message, 
      decision: error.decision || "BLOCK", 
      reasons: error.reasons || [] 
    });
  }
});

import { ExecutionGraphService } from "./graph/ExecutionGraphService";
const graphService = new ExecutionGraphService(prisma);

fastify.get("/api/executions/:id", async (request, reply) => {
  const { id: executionId } = request.params as { id: string };
  try {
    const graph = await graphService.getExecutionGraph(executionId);
    return graph;
  } catch (e: any) {
    reply.code(404).send({ error: e.message });
  }
});

fastify.get("/health", async () => {
  return { status: "ok" };
});

fastify.get("/interventions", async (request, reply) => {
  return interventionManager.getPendingInterventions();
});

fastify.post("/interventions/:id/resolve", async (request: any, reply) => {
  const { id } = request.params;
  const { decision } = request.body;
  try {
    const result = await interventionManager.resolveIntervention(id, decision);
    return { success: true, intervention: result };
  } catch (e: any) {
    reply.code(400);
    return { error: e.message };
  }
});

import { MetricsService } from "./api/MetricsService";
const metricsService = new MetricsService(prisma);

fastify.get("/api/overview", async () => {
  return metricsService.getOverview();
});

fastify.get("/api/agents", async () => {
  return metricsService.getAgents();
});

fastify.get("/api/agents/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const data = await metricsService.getAgentDetail(id);
  if (!data) return reply.code(404).send({ error: "Agent not found" });
  return data;
});

fastify.get("/api/executions", async () => {
  return metricsService.getExecutions();
});

fastify.get("/api/behavior-changes", async () => {
  return metricsService.getBehaviorChanges();
});

const start = async () => {
  try {
    // Seed execution contract for test
    const execId = "test-exec-1";
    
    try {
      // Ensure agent exists
      const agentId = "code-review-agent";
      await prisma.agent.upsert({
        where: { id: agentId },
        update: {},
        create: {
          id: agentId,
          name: "Code Review Agent",
          description: "Agent responsible for reviewing PRs"
        }
      });

      await prisma.execution.upsert({
        where: { id: execId },
        update: {},
        create: {
          id: execId,
          agentId: agentId,
          status: "CREATED",
          objective: "Review PR"
        }
      });

      await prisma.executionContract.upsert({
        where: { executionId: execId },
        update: {
          allowedSystems: ["github", "http"],
          allowedCapabilities: ["repository.read", "communication.write", "file.read", "external_network.write"],
        },
        create: {
          executionId: execId,
          objective: "Review pull request #42 and report issues",
          expectedActions: ["read_pull_request", "read_diff", "read_changed_files", "read_tests", "run_tests", "analyze_changes", "post_review"],
          allowedSystems: ["github", "http"],
          allowedCapabilities: ["repository.read", "communication.write", "file.read", "external_network.write"],
          restrictedResources: ["secrets", "environment", "production", ".env"]
        }
      });

      // Generic Notification Execution (Universal Proof)
      const genericExecId = "test-exec-2";
      await prisma.agent.upsert({
        where: { id: "generic-agent" },
        update: {},
        create: {
          id: "generic-agent",
          name: "Generic Assistant",
          description: "Universal generic agent"
        }
      });

      await prisma.execution.upsert({
        where: { id: genericExecId },
        update: {},
        create: {
          id: genericExecId,
          agentId: "generic-agent",
          status: "CREATED",
          objective: "Send a notification"
        }
      });

      await prisma.executionContract.upsert({
        where: { executionId: genericExecId },
        update: {},
        create: {
          executionId: genericExecId,
          objective: "Send a notification",
          expectedActions: ["post", "send_message"],
          allowedSystems: ["http", "slack"],
          allowedCapabilities: ["communication.write", "external_network.write"],
          restrictedResources: ["billing", "admin"]
        }
      });

      console.log("Database seeded successfully.");
    } catch (err) {
      console.log("Warning: Database seeding failed (is Postgres running?). Proceeding without DB.");
    }

    await fastify.listen({ port: 4000, host: "0.0.0.0" });
    console.log("HEED Runtime API listening on port 4000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
