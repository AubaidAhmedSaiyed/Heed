"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interventionManager = void 0;
const fastify_1 = __importDefault(require("fastify"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// In a real app we'd inject these from a DI container
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
const PolicyEvaluator_1 = require("./trajectory/evaluators/PolicyEvaluator");
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
exports.interventionManager = new InterventionManager_1.InterventionManager(prisma);
trajectoryEngine.register(new ContractEvaluator_1.ContractEvaluator());
trajectoryEngine.register(new PolicyEvaluator_1.PolicyEvaluator());
trajectoryEngine.register(new SensitivityEvaluator_1.SensitivityEvaluator());
trajectoryEngine.register(new TrajectoryEvaluator_1.TrajectoryEvaluator());
trajectoryEngine.register(new BehaviorEvaluator_1.BehaviorEvaluator());
trajectoryEngine.register(new CapabilityEvaluator_1.CapabilityEvaluator());
const connectorManager = new connectors_1.ConnectorManager();
connectorManager.register(new connectors_1.GitHubConnector());
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
const JWT_SECRET = process.env.JWT_SECRET || "heed-dev-jwt-secret-do-not-use-in-prod";
// Authorization hook
fastify.addHook("preHandler", async (request, reply) => {
    if (request.url.startsWith("/health") ||
        request.url.startsWith("/api/v1/auth/signup") ||
        request.url.startsWith("/api/v1/auth/login")) {
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
            request.workspaceId = apiKey.workspaceId;
        }
        catch (e) {
            if (token !== "dev-key") {
                reply.code(401).send({ error: "Unauthorized: Invalid API Key" });
                return;
            }
            request.workspaceId = "default-workspace";
        }
    }
    else if (isDashboardRoute || (isRuntimeRoute && request.url.startsWith("/api/v1/"))) {
        // DASHBOARD / JWT Auth
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            request.userId = decoded.userId;
            // Skip workspace check for /me
            if (request.url === "/api/v1/auth/me")
                return;
            const requestedWorkspaceId = request.headers["x-workspace-id"];
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
            request.workspaceId = requestedWorkspaceId;
        }
        catch (e) {
            reply.code(401).send({ error: "Unauthorized: Invalid JWT token" });
            return;
        }
    }
});
// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
fastify.post("/api/v1/auth/signup", async (request, reply) => {
    const { email, password, name } = request.body;
    if (!email || !password)
        return reply.code(400).send({ error: "Email and password required" });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
        return reply.code(400).send({ error: "Email already in use" });
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
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
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const defaultWorkspace = user.memberships[0].workspace;
    reply.send({ token, user: { id: user.id, email: user.email, name: user.name }, defaultWorkspace });
});
fastify.post("/api/v1/auth/login", async (request, reply) => {
    const { email, password } = request.body;
    if (!email || !password)
        return reply.code(400).send({ error: "Email and password required" });
    const user = await prisma.user.findUnique({ where: { email }, include: { memberships: { include: { workspace: true } } } });
    if (!user)
        return reply.code(401).send({ error: "Invalid credentials" });
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid)
        return reply.code(401).send({ error: "Invalid credentials" });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    reply.send({ token, user: { id: user.id, email: user.email, name: user.name }, workspaces: user.memberships.map(m => m.workspace) });
});
fastify.get("/api/v1/auth/me", async (request, reply) => {
    const userId = request.userId;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { memberships: { include: { workspace: true } } }
    });
    if (!user)
        return reply.code(404).send({ error: "User not found" });
    reply.send({
        user: { id: user.id, email: user.email, name: user.name },
        workspaces: user.memberships.map(m => m.workspace)
    });
});
// ==========================================
// DASHBOARD V1 ROUTES (Multi-Tenant)
// ==========================================
const MetricsService_1 = require("./api/MetricsService");
const metricsService = new MetricsService_1.MetricsService(prisma);
fastify.get("/api/v1/overview", async (request) => {
    return metricsService.getOverview(request.workspaceId);
});
fastify.get("/api/v1/agents", async (request) => {
    return metricsService.getAgents(request.workspaceId);
});
fastify.post("/api/v1/agents", async (request, reply) => {
    const workspaceId = request.workspaceId;
    const { name, description } = request.body;
    const agent = await prisma.agent.create({
        data: { name, description, workspaceId }
    });
    return agent;
});
fastify.get("/api/v1/agents/:id", async (request, reply) => {
    const { id } = request.params;
    const data = await metricsService.getAgentDetail(request.workspaceId, id);
    if (!data)
        return reply.code(404).send({ error: "Agent not found" });
    return data;
});
fastify.get("/api/v1/executions", async (request) => {
    return metricsService.getExecutions(request.workspaceId);
});
const ExecutionGraphService_1 = require("./graph/ExecutionGraphService");
const graphService = new ExecutionGraphService_1.ExecutionGraphService(prisma);
fastify.get("/api/v1/executions/:id", async (request, reply) => {
    const { id: executionId } = request.params;
    const workspaceId = request.workspaceId;
    const execution = await prisma.execution.findFirst({
        where: { id: executionId, agent: { workspaceId } }
    });
    if (!execution)
        return reply.code(404).send({ error: "Execution not found" });
    try {
        const graph = await graphService.getExecutionGraph(executionId);
        return graph;
    }
    catch (e) {
        reply.code(404).send({ error: e.message });
    }
});
fastify.get("/api/v1/policies", async (request) => {
    return prisma.policy.findMany({
        where: { workspaceId: request.workspaceId },
        include: { versions: true }
    });
});
fastify.post("/api/v1/policies", async (request, reply) => {
    const data = request.body;
    const workspaceId = request.workspaceId;
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
        where: { workspaceId: request.workspaceId },
        orderBy: { createdAt: "desc" }
    });
});
fastify.post("/api/v1/api-keys", async (request, reply) => {
    const { name } = request.body;
    const workspaceId = request.workspaceId;
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
    const { id } = request.params;
    const workspaceId = request.workspaceId;
    const key = await prisma.apiKey.findFirst({ where: { id, workspaceId } });
    if (!key)
        return reply.code(404).send({ error: "Key not found" });
    await prisma.apiKey.delete({ where: { id } });
    return { success: true };
});
fastify.get("/api/v1/interventions", async (request, reply) => {
    const workspaceId = request.workspaceId;
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
fastify.post("/api/v1/interventions/:id/resolve", async (request, reply) => {
    const { id } = request.params;
    const { decision } = request.body;
    const workspaceId = request.workspaceId;
    const intervention = await prisma.intervention.findFirst({
        where: { id, execution: { agent: { workspaceId } } }
    });
    if (!intervention)
        return reply.code(404).send({ error: "Intervention not found" });
    try {
        const result = await exports.interventionManager.resolveIntervention(id, decision);
        return { success: true, intervention: result };
    }
    catch (e) {
        reply.code(400).send({ error: e.message });
    }
});
fastify.get("/api/v1/events", async (request) => {
    const query = request.query;
    const includePayload = query.includePayload === 'true' || query.includePayload === true;
    const workspaceId = request.workspaceId;
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
    const workspaceId = request.workspaceId;
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
    const workspaceId = request.workspaceId;
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
    const { objective, contract, authority } = request.body;
    const agentId = request.headers["x-agent-id"] || "unknown-agent";
    const workspaceId = request.workspaceId || "default-workspace";
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
    const { id: executionId } = request.params;
    const rawAction = request.body;
    const workspaceId = request.workspaceId;
    const execution = await prisma.execution.findFirst({
        where: { id: executionId, agent: { workspaceId } }
    });
    if (!execution) {
        return reply.status(404).send({ error: "Execution not found or not in workspace" });
    }
    try {
        const result = await runtimeGateway.processActionRequest(workspaceId, executionId, rawAction);
        reply.send(result);
    }
    catch (error) {
        console.error("[SERVER] Action Error:", error);
        if (error.decision) {
            reply.status(403).send({
                error: error.message,
                decision: error.decision,
                reasons: error.reasons || []
            });
        }
        else {
            reply.status(502).send({
                error: error.message,
                system: "connector_failure"
            });
        }
    }
});
fastify.get("/health", async () => {
    return { status: "ok" };
});
const start = async () => {
    try {
        await fastify.listen({ port: 4000, host: "0.0.0.0" });
        console.log("HEED API listening on port 4000");
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
