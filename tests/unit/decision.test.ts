import { describe, it, expect } from 'vitest';
import { ContractEvaluator } from '../../apps/api/src/trajectory/evaluators/ContractEvaluator';
import { SensitivityEvaluator } from '../../apps/api/src/trajectory/evaluators/SensitivityEvaluator';
import { SequenceEvaluator } from '../../apps/api/src/trajectory/evaluators/SequenceEvaluator';

describe('Decision Engine Evaluators', () => {
  it('ContractEvaluator allows valid action', async () => {
    const evaluator = new ContractEvaluator();
    const result = await evaluator.evaluate({
      action: { system: 'github', operation: 'read_pull_request', resource: 'owner/repo/pull/1', capability: 'repository.read' } as any,
      contract: { allowedSystems: ['github'], allowedCapabilities: ['repository.read'], restrictedResources: [], expectedActions: [] } as any
    });
    expect(result.score).toBe(0);
  });

  it('ContractEvaluator blocks invalid system', async () => {
    const evaluator = new ContractEvaluator();
    const result = await evaluator.evaluate({
      action: { system: 'slack', operation: 'send_message', resource: 'channel', capability: 'communication.write' } as any,
      contract: { allowedSystems: ['github'], allowedCapabilities: ['repository.read'], restrictedResources: [], expectedActions: [] } as any
    });
    expect(result.score).toBeGreaterThan(0);
  });

  it('SensitivityEvaluator flags restricted resources', async () => {
    const evaluator = new SensitivityEvaluator();
    const result = await evaluator.evaluate({
      action: { sensitivity: 'RESTRICTED' } as any
    });
    expect(result.score).toBe(30);
  });

  it('SequenceEvaluator detects unexpected transition', async () => {
    const evaluator = new SequenceEvaluator();
    const result = await evaluator.evaluate({
      action: { operation: 'read_file', resource: '.env' } as any,
      previousActions: [{ operation: 'read_tests', system: 'github', resource: 'owner/repo' } as any]
    });
    expect(result.score).toBe(40);
  });
});
