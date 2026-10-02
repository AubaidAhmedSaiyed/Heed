import { describe, it, expect, beforeEach } from 'vitest';
import { RuntimeGateway } from '../src/runtime/RuntimeGateway';
import { ActionNormalizer } from '../src/actions/ActionNormalizer';
import { DecisionEngine } from '../src/trajectory/DecisionEngine';
import { ConnectorManager, HttpSimulator, FileSystemSimulator } from '@heed/connectors';
import { EventStore } from '../src/events/EventStore';
import { ContractEvaluator } from '../src/trajectory/evaluators/ContractEvaluator';
import { SensitivityEvaluator } from '../src/trajectory/evaluators/SensitivityEvaluator';
import { InterventionManager } from '../src/interventions/InterventionManager';
import { PrismaClient } from '@prisma/client';

describe('HEED E2E Integration - Two Unrelated Customers', () => {
  let prisma: PrismaClient;
  let runtimeGateway: RuntimeGateway;
  
  beforeEach(async () => {
    prisma = new PrismaClient();
    const normalizer = new ActionNormalizer();
    const eventStore = new EventStore(prisma);
    const trajectoryEngine = new DecisionEngine();
    const interventionManager = new InterventionManager();
    
    trajectoryEngine.register(new ContractEvaluator());
    trajectoryEngine.register(new SensitivityEvaluator());
    
    const connectorManager = new ConnectorManager();
    connectorManager.register(new HttpSimulator());
    connectorManager.register(new FileSystemSimulator());
    
    runtimeGateway = new RuntimeGateway({
      normalizer,
      trajectoryEngine,
      connectorManager,
      eventStore,
      interventionManager,
      prisma
    });
  });

  it('Customer A (Code Review Agent) correctly blocks restricted files and allows safe files', async () => {
    // 1. Setup workspace & agent
    const workspaceId = "customer-a-workspace";
    await prisma.workspace.upsert({ where: { id: workspaceId }, update: {}, create: { id: workspaceId, name: "Customer A" } });
    
    const agentId = "agent-customer-a";
    await prisma.agent.upsert({ where: { id: agentId }, update: { workspaceId }, create: { id: agentId, name: "Code Reviewer", workspaceId } });

    // 2. Setup execution and contract
    const executionId = "exec-customer-a";
    await prisma.execution.upsert({ where: { id: executionId }, update: {}, create: { id: executionId, agentId, status: "CREATED", objective: "Review Code" } });
    
    await prisma.executionContract.upsert({
      where: { executionId },
      update: {
        allowedSystems: ["filesystem", "github"],
        allowedCapabilities: ["file.read", "repository.read"],
        restrictedResources: [".env", "secrets.yml"]
      },
      create: {
        executionId,
        objective: "Review code",
        allowedSystems: ["filesystem", "github"],
        allowedCapabilities: ["file.read", "repository.read"],
        restrictedResources: [".env", "secrets.yml"]
      }
    });

    // 3. Test ALLOW action
    const allowRes = await runtimeGateway.processActionRequest(executionId, {
      system: "filesystem",
      operation: "read_file",
      resource: "src/index.ts",
      capability: "file.read",
      arguments: { path: "src/index.ts" }
    });
    
    expect(allowRes).toBeDefined();

    // 4. Test BLOCK action (restricted resource)
    try {
      await runtimeGateway.processActionRequest(executionId, {
        system: "filesystem",
        operation: "read_file",
        resource: ".env",
        capability: "file.read",
        arguments: { path: ".env" }
      });
      expect.fail("Should have blocked .env access");
    } catch (e: any) {
      expect(e.message).toContain("Action blocked");
    }
  });

  it('Customer B (Marketing Agent) correctly allows external posts but blocks capability mismatch', async () => {
    // 1. Setup workspace & agent
    const workspaceId = "customer-b-workspace";
    await prisma.workspace.upsert({ where: { id: workspaceId }, update: {}, create: { id: workspaceId, name: "Customer B" } });
    
    const agentId = "agent-customer-b";
    await prisma.agent.upsert({ where: { id: agentId }, update: { workspaceId }, create: { id: agentId, name: "Marketing Bot", workspaceId } });

    // 2. Setup execution and contract
    const executionId = "exec-customer-b";
    await prisma.execution.upsert({ where: { id: executionId }, update: {}, create: { id: executionId, agentId, status: "CREATED", objective: "Post Tweet" } });
    
    await prisma.executionContract.upsert({
      where: { executionId },
      update: {
        allowedSystems: ["http"],
        allowedCapabilities: ["external_network.write"],
        restrictedResources: ["billing", "admin"]
      },
      create: {
        executionId,
        objective: "Post Marketing Update",
        allowedSystems: ["http"],
        allowedCapabilities: ["external_network.write"],
        restrictedResources: ["billing", "admin"]
      }
    });

    // 3. Test ALLOW action
    const allowRes = await runtimeGateway.processActionRequest(executionId, {
      system: "http",
      operation: "post",
      resource: "api.twitter.com/tweets",
      capability: "external_network.write",
      arguments: { url: "https://api.twitter.com/tweets", method: "POST" }
    });
    
    expect(allowRes).toBeDefined();

    // 4. Test BLOCK action (capability mismatch)
    try {
      await runtimeGateway.processActionRequest(executionId, {
        system: "http",
        operation: "delete_account",
        resource: "api.twitter.com/account",
        capability: "external_network.delete", // not allowed in contract
        arguments: { url: "https://api.twitter.com/account", method: "DELETE" }
      });
      expect.fail("Should have blocked due to unauthorized capability");
    } catch (e: any) {
      expect(e.message).toContain("Action blocked");
    }
  });
});
