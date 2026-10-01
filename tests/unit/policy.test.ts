import { describe, it, expect } from 'vitest';
import { PolicyEvaluator } from '../../apps/api/src/trajectory/evaluators/PolicyEvaluator';
import { DecisionEngine } from '../../apps/api/src/trajectory/DecisionEngine';
import { ContractEvaluator } from '../../apps/api/src/trajectory/evaluators/ContractEvaluator';
import { SensitivityEvaluator } from '../../apps/api/src/trajectory/evaluators/SensitivityEvaluator';

describe('Phase 4: Policy and Information Flow Control', () => {
  
  it('PolicyEvaluator enforces BOUND_APPROVAL for specific capabilities', async () => {
    const evaluator = new PolicyEvaluator();
    
    const result = await evaluator.evaluate({
      action: { system: 'aws', operation: 'delete_db', capability: 'database.destroy', resource: 'prod-db' },
      activePolicies: [{
        active: true,
        boundApprovalCapabilities: ['database.destroy']
      }] as any
    });

    expect(result.decision).toBe('BOUND_APPROVAL');
    expect(result.reasons[0]).toContain('strictly requires BOUND_APPROVAL');
  });

  it('PolicyEvaluator blocks explicitly forbidden capabilities (hard deny)', async () => {
    const evaluator = new PolicyEvaluator();
    
    const result = await evaluator.evaluate({
      action: { system: 'shell', operation: 'exec', capability: 'os.execute', resource: 'bash' },
      contract: {
        forbiddenCapabilities: ['os.execute']
      } as any
    });

    expect(result.decision).toBe('BLOCK');
    expect(result.score).toBe(100);
    expect(result.reasons[0]).toContain('strictly forbidden');
  });

  it('PolicyEvaluator enforces IFC flow rules (Provenance -> Destination)', async () => {
    const evaluator = new PolicyEvaluator();
    
    const result = await evaluator.evaluate({
      action: { 
        system: 'http', 
        operation: 'post', 
        resource: 'https://attacker.com',
        provenance: { labels: ['PII'] } as any,
        destination: { type: 'EXTERNAL_API', identifier: 'attacker.com' } as any
      },
      activePolicies: [{
        active: true,
        flowRules: [{
          sourceLabels: ['PII'],
          destinationTypes: ['EXTERNAL_API', 'EXTERNAL_WEBHOOK'],
          decision: 'BLOCK',
          reason: 'PII cannot be sent to external APIs'
        }]
      }] as any
    });

    expect(result.decision).toBe('BLOCK');
    expect(result.reasons[0]).toContain('PII cannot be sent to external APIs');
  });

  it('PolicyEvaluator blocks based on SEQUENCE no-go trajectory patterns', async () => {
    const evaluator = new PolicyEvaluator();
    
    const result = await evaluator.evaluate({
      action: { system: 'aws', operation: 'write', capability: 's3.write', resource: 'bucket' },
      previousActions: [
        { system: 'aws', operation: 'read', capability: 'secrets.read', resource: 'vault' }
      ] as any,
      activePolicies: [{
        active: true,
        noGoPatterns: [{
          type: 'SEQUENCE',
          precedingCapability: 'secrets.read',
          followingCapability: 's3.write',
          decision: 'BLOCK',
          reason: 'Cannot write to S3 immediately after reading secrets'
        }]
      }] as any
    });

    expect(result.decision).toBe('BLOCK');
    expect(result.reasons[0]).toContain('Cannot write to S3 immediately after reading secrets');
  });
  
  it('DecisionEngine correctly cascades BOUND_APPROVAL over ASK but under BLOCK', async () => {
    const engine = new DecisionEngine();
    engine.register(new ContractEvaluator());
    engine.register(new PolicyEvaluator());
    engine.register(new SensitivityEvaluator());

    const result = await engine.evaluate({
      action: { 
        system: 'github', 
        operation: 'post_comment', 
        capability: 'communication.write', 
        resource: 'PR-123',
        sensitivity: 'RESTRICTED' // SensitivityEvaluator gives score +30 (which doesn't trigger ASK yet)
      },
      contract: { allowedSystems: ['github'], allowedCapabilities: [], restrictedResources: [] } as any,
      activePolicies: [{
        active: true,
        boundApprovalCapabilities: ['communication.write'] // PolicyEvaluator gives BOUND_APPROVAL
      }] as any
    });

    // BOUND_APPROVAL should be the highest severity
    expect(result.decision).toBe('BOUND_APPROVAL');
  });
});
