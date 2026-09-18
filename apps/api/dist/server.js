"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interventionManager = void 0;
const fastify_1 = __importDefault(require("fastify"));
// In a real app we'd inject these from a DI container
// but here we instantiate directly for the MVP
const RuntimeGateway_1 = require("./runtime/RuntimeGateway");
const ActionNormalizer_1 = require("./actions/ActionNormalizer");
const DecisionEngine_1 = require("./trajectory/DecisionEngine");
const connectors_1 = require("@heed/connectors");
const EventStore_1 = require("./events/EventStore");
const ContractEvaluator_1 = require("./trajectory/evaluators/ContractEvaluator");
const SensitivityEvaluator_1 = require("./trajectory/evaluators/SensitivityEvaluator");
const TrajectoryEvaluator_1 = require("./trajectory/evaluators/TrajectoryEvaluator");
const BehaviorEvaluator_1 = require("./trajectory/evaluators/BehaviorEvaluator");
const CapabilityEvaluator_1 = require("./trajectory/evaluators/CapabilityEvaluator");
const client_1 = require("@prisma/client");
const InterventionManager_1 = require("./interventions/InterventionManager");
const prisma = new client_1.PrismaClient();
const fastify = (0, fastify_1.default)({ logger: true });
const cors_1 = __importDefault(require("@fastify/cors"));
fastify.register(cors_1.default, {
    origin: "*"
});
// Setup dependencies
const normalizer = new ActionNormalizer_1.ActionNormalizer();
const eventStore = new EventStore_1.EventStore(prisma);
const trajectoryEngine = new DecisionEngine_1.DecisionEngine();
exports.interventionManager = new InterventionManager_1.InterventionManager();
trajectoryEngine.register(new ContractEvaluator_1.ContractEvaluator());
trajectoryEngine.register(new SensitivityEvaluator_1.SensitivityEvaluator());
trajectoryEngine.register(new TrajectoryEvaluator_1.TrajectoryEvaluator());
trajectoryEngine.register(new BehaviorEvaluator_1.BehaviorEvaluator());
trajectoryEngine.register(new CapabilityEvaluator_1.CapabilityEvaluator());
const connectorManager = new connectors_1.ConnectorManager();
connectorManager.register(new connectors_1.GitHubConnector()); // Enabled real GitHub integration
connectorManager.register(new connectors_1.HttpConnector());
connectorManager.register(new connectors_1.FileSystemSimulator());
connectorManager.register(new connectors_1.HttpSimulator());
const runtimeGateway = new RuntimeGateway_1.RuntimeGateway({
    normalizer,
    trajectoryEngine,
    connectorManager,
    eventStore,
    interventionManager: exports.interventionManager,
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
    const { id: executionId } = request.params;
    const rawAction = request.body;
    try {
        const result = await runtimeGateway.processActionRequest(executionId, rawAction);
        reply.send(result);
    }
    catch (error) {
        reply.status(403).send({
            error: error.message,
            decision: error.decision || "BLOCK",
            reasons: error.reasons || []
        });
    }
});
const ExecutionGraphService_1 = require("./graph/ExecutionGraphService");
const graphService = new ExecutionGraphService_1.ExecutionGraphService(prisma);
fastify.get("/api/executions/:id", async (request, reply) => {
    const { id: executionId } = request.params;
    try {
        const graph = await graphService.getExecutionGraph(executionId);
        return graph;
    }
    catch (e) {
        reply.code(404).send({ error: e.message });
    }
});
fastify.get("/health", async () => {
    return { status: "ok" };
});
fastify.get("/interventions", async (request, reply) => {
    return exports.interventionManager.getPendingInterventions();
});
fastify.post("/interventions/:id/resolve", async (request, reply) => {
    const { id } = request.params;
    const { decision } = request.body;
    try {
        const result = await exports.interventionManager.resolveIntervention(id, decision);
        return { success: true, intervention: result };
    }
    catch (e) {
        reply.code(400);
        return { error: e.message };
    }
});
const MetricsService_1 = require("./api/MetricsService");
const metricsService = new MetricsService_1.MetricsService(prisma);
fastify.get("/api/overview", async () => {
    return metricsService.getOverview();
});
fastify.get("/api/agents", async () => {
    return metricsService.getAgents();
});
fastify.get("/api/agents/:id", async (request, reply) => {
    const { id } = request.params;
    const data = await metricsService.getAgentDetail(id);
    if (!data)
        return reply.code(404).send({ error: "Agent not found" });
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
        }
        catch (err) {
            console.log("Warning: Database seeding failed (is Postgres running?). Proceeding without DB.");
        }
        await fastify.listen({ port: 4000, host: "0.0.0.0" });
        console.log("HEED Runtime API listening on port 4000");
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
