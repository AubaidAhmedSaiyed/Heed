import { expect, test, describe } from 'vitest';
import { RuntimeGateway } from '../../apps/api/src/runtime/RuntimeGateway';
import { InterventionManager } from '../../apps/api/src/interventions/InterventionManager';
import { DecisionEngine } from '../../apps/api/src/trajectory/DecisionEngine';
import { ContractEvaluator } from '../../apps/api/src/trajectory/evaluators/ContractEvaluator';
import { CapabilityEvaluator } from '../../apps/api/src/trajectory/evaluators/CapabilityEvaluator';
import { ConnectorManager } from '../../packages/connectors/src/ConnectorManager';
import { HttpSimulator } from '../../packages/connectors/src/HttpSimulator';

import { vi } from 'vitest';

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      execution = {
        findUnique: async () => ({ status: 'RUNNING' }),
        update: async () => ({})
      };
      executionContract = {
        findUnique: async () => null // triggers fallback
      };
      actionEvent = {
        create: async () => ({})
      };
    }
  };
});

describe('Security Bypass and Intervention Tests', () => {
  test('A blocked action never reaches the connector', async () => {
    // Setup minimal environment
    const normalizer = { normalize: async (id, req) => req };
    const eventStore = { 
      recordActionBlocked: async () => {}, 
      recordActionAllowed: async () => {}, 
      recordActionExecuted: async () => {},
      recordActionFlagged: async () => {} 
    };
    const trajectoryEngine = new DecisionEngine();
    trajectoryEngine.register({
      name: 'MockBlock',
      evaluate: async () => ({ score: 100, reasons: ['Forces BLOCK'] })
    });
    
    // We create a mock connector that tracks if it was called
    let called = false;
    const mockConnector = {
      name: 'http',
      capabilities: ['external_network.write'],
      execute: async () => { called = true; return {}; }
    };
    
    const connectorManager = new ConnectorManager();
    connectorManager.register(mockConnector);

    const gateway = new RuntimeGateway({
      normalizer,
      trajectoryEngine,
      connectorManager,
      eventStore,
      interventionManager: new InterventionManager()
    });

    // An action that violates the contract (e.g. unknown system)
    const rawAction = {
      system: 'unknown_system',
      operation: 'attack',
      resource: 'db',
      capability: 'database.delete',
      arguments: {}
    };

    let error;
    try {
      await gateway.processActionRequest('exec-1', rawAction);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toContain('Action blocked');
    expect(called).toBe(false); // Proves NO SIDE EFFECT
  });

  test('ASK pauses execution and human rejection stops action', async () => {
    const normalizer = { normalize: async (id, req) => req };
    const eventStore = { 
      recordActionFlagged: async () => {}, 
      recordActionBlocked: async () => {},
      recordActionAllowed: async () => {},
      recordActionExecuted: async () => {} 
    };
    const trajectoryEngine = new DecisionEngine();
    trajectoryEngine.register({
      name: 'MockAsk',
      evaluate: async () => ({ score: 60, reasons: ['Forces ASK'] })
    }); 
    
    let called = false;
    const mockConnector = {
      name: 'http',
      capabilities: ['external_network.write'],
      execute: async () => { called = true; return {}; }
    };
    
    const connectorManager = new ConnectorManager();
    connectorManager.register(mockConnector);
    const interventionManager = new InterventionManager();

    const gateway = new RuntimeGateway({
      normalizer,
      trajectoryEngine,
      connectorManager,
      eventStore,
      interventionManager
    });

    const rawAction = {
      system: 'http',
      operation: 'post',
      resource: 'httpbin',
      capability: 'external_network.write',
      arguments: {}
    };

    // Trigger action which will pause
    const actionPromise = gateway.processActionRequest('exec-2', rawAction);
    
    // Ensure it paused by yielding
    await new Promise(r => setTimeout(r, 50));
    
    const interventions = interventionManager.getPendingInterventions();
    expect(interventions.length).toBe(1);
    expect(called).toBe(false); // Proves it paused before side effect

    // Reject it
    await interventionManager.resolveIntervention(interventions[0].id, 'BLOCK');
    
    let error;
    try {
      await actionPromise;
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toContain('blocked by human intervention');
    expect(called).toBe(false); // Proves no side effect after rejection
  });
});
