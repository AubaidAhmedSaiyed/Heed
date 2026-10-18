import { Evaluator, EvaluationContext, EvaluationResult } from "./Evaluator";
import { hasAnyLabel } from "@heed-ai/runtime";

export class PolicyEvaluator implements Evaluator {
  name = "PolicyEvaluator";
  priority = 15; // Evaluate right after Contract but before complex Trajectory

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { action, activePolicies, contract } = context;
    let score = 0;
    const reasons: string[] = [];
    const matchedPolicies: string[] = [];
    let highestDecision: "ALLOW" | "ASK" | "BLOCK" | "ALLOW_CONSTRAINED" | "BOUND_APPROVAL" | undefined;

    const setDecision = (decision: "ALLOW" | "ASK" | "BLOCK" | "ALLOW_CONSTRAINED" | "BOUND_APPROVAL") => {
      const severity = {
        "ALLOW": 0, "ALLOW_CONSTRAINED": 1, "ASK": 2, "BOUND_APPROVAL": 3, "BLOCK": 4
      };
      if (!highestDecision || severity[decision] > severity[highestDecision]) {
        highestDecision = decision;
      }
    };

    // Aggregate rules from active policies and contract
    const flowRules = [...(contract?.flowRules || [])];
    const noGoPatterns = [...(contract?.noGoPatterns || [])];
    const forbiddenCapabilities = new Set(contract?.forbiddenCapabilities || []);
    const boundApprovalCapabilities = new Set<string>();

    const policiesList = [
      ...(activePolicies || []),
      ...((context.action as any)?.activePolicyVersions || [])
    ];
    for (const p of policiesList) {
      if (p.active === false || (p.status && p.status !== "PUBLISHED")) continue;
      flowRules.push(...(p.flowRules || []));
      noGoPatterns.push(...(p.noGoPatterns || []));
      (p.forbiddenCapabilities || []).forEach((c: string) => forbiddenCapabilities.add(c));
      (p.boundApprovalCapabilities || []).forEach((c: string) => boundApprovalCapabilities.add(c));
    }

    // Helper to check against capability or pattern
    const matchesCapabilityRule = (capability: string | undefined, system: string | undefined, pattern: string): boolean => {
      if (!pattern) return false;
      const p = pattern.trim().toLowerCase();
      
      if (capability) {
        const c = capability.toLowerCase();
        if (c === p) return true;
        if (p.endsWith(".*") && c.startsWith(p.slice(0, -2))) return true;
        if (p.startsWith("*.") && c.endsWith(p.slice(2))) return true;
        if (p === "*") return true;
      }
      
      if (system) {
        const s = system.toLowerCase();
        if (s === p) return true;
        if (p === `${s}.*` || p === `${s}.write` || p === `${s}.read`) return true;
        if ((s === 'postgres' || s === 'postgresql') && (p.startsWith('database') || p === 'database')) return true;
        if (s === 'database' && (p.startsWith('postgres') || p === 'postgres')) return true;
      }
      
      return false;
    };

    const findMatchingRule = (ruleSet: Set<string>): string | null => {
      for (const pattern of ruleSet) {
        if (matchesCapabilityRule(action.capability, action.system, pattern)) {
          return pattern;
        }
      }
      return null;
    };

    // 1. Forbidden Capabilities (Hard Deny)
    const forbiddenMatch = findMatchingRule(forbiddenCapabilities);
    if (forbiddenMatch) {
      reasons.push(`[POLICY_VIOLATION] Capability '${action.capability || action.system}' is strictly forbidden by policy (rule: '${forbiddenMatch}').`);
      setDecision("BLOCK");
      // Hard deny can return immediately
      return { decision: "BLOCK", score: 100, reasons, matchedPolicies };
    }

    // 2. Bound Approval Required
    const approvalMatch = findMatchingRule(boundApprovalCapabilities);
    if (approvalMatch) {
      reasons.push(`[POLICY_REQUIREMENT] Capability '${action.capability || action.system}' strictly requires BOUND_APPROVAL by policy (rule: '${approvalMatch}').`);
      setDecision("BOUND_APPROVAL");
    }

    // 3. Information Flow Rules (Provenance -> Destination)
    if (action.provenance?.labels && action.destination) {
      for (const rule of flowRules) {
        // If action has ANY of the source labels AND destination matches
        if (action.provenance.labels.some((l: any) => rule.sourceLabels.includes(l)) &&
            rule.destinationTypes.includes(action.destination.type)) {
          reasons.push(`[IFC_VIOLATION] ${rule.reason}`);
          if (rule.id) matchedPolicies.push(rule.id);
          setDecision(rule.decision);
        }
      }
    }

    // 4. General Provenance Constraints
    if (action.provenance?.labels && contract?.forbiddenProvenance) {
      if (action.provenance.labels.some((l: any) => contract.forbiddenProvenance.includes(l))) {
        reasons.push(`[PROVENANCE_VIOLATION] Contract forbids processing data with labels: ${contract.forbiddenProvenance.join(", ")}`);
        setDecision("BLOCK");
      }
    }

    // 5. No-Go Trajectory Patterns
    // (This requires looking at previousActions - implementing basic SEQUENCE and AFTER)
    if (context.previousActions && context.previousActions.length > 0) {
      for (const pattern of noGoPatterns) {
        if (pattern.type === "SEQUENCE" && pattern.precedingCapability && pattern.followingCapability) {
          const lastAction = context.previousActions[context.previousActions.length - 1];
          if (lastAction.capability === pattern.precedingCapability && action.capability === pattern.followingCapability) {
             reasons.push(`[NO_GO_PATTERN] ${pattern.reason}`);
             if (pattern.id) matchedPolicies.push(pattern.id);
             setDecision(pattern.decision);
          }
        }
        else if (pattern.type === "AFTER" && pattern.precedingCapability && pattern.followingCapability) {
          const hasPreceding = context.previousActions.some(a => a.capability === pattern.precedingCapability);
          if (hasPreceding && action.capability === pattern.followingCapability) {
             reasons.push(`[NO_GO_PATTERN] ${pattern.reason}`);
             if (pattern.id) matchedPolicies.push(pattern.id);
             setDecision(pattern.decision);
          }
        }
      }
    }

    if (highestDecision) {
      // If we got ASK or BLOCK from policies, it adds significant risk score
      if (highestDecision === "BLOCK") score += 100;
      else if (highestDecision === "ASK" || highestDecision === "BOUND_APPROVAL") score += 50;
    }

    return { 
      decision: highestDecision, 
      score, 
      reasons, 
      matchedPolicies: Array.from(new Set(matchedPolicies)) 
    };
  }
}
