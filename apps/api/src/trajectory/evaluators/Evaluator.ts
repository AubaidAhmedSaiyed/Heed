import { Action, ExecutionContract, AuthorityContext } from "@heed/runtime";

export interface EvaluationContext {
  action: Action;
  contract?: ExecutionContract;
  objective?: string;
  previousActions?: Action[];
  behaviorProfile?: any;
  authority?: AuthorityContext; // Added Phase 4
  activePolicies?: any[]; // Array of Policy objects
}

export interface EvaluationResult {
  /** If an evaluator returns a definitive decision, it takes precedence based on evaluator priority */
  decision?: "ALLOW" | "ASK" | "BLOCK" | "ALLOW_CONSTRAINED" | "BOUND_APPROVAL";
  score: number;
  reasons: string[];
  matchedPolicies?: string[];
}

export interface Evaluator {
  name: string;
  /**
   * Priority defines evaluation order. Lower number = evaluated first.
   * 0-10: State/Hard Deny
   * 11-20: Flow/Provenance
   * 21-40: Trajectory/Context
   * 41-60: Budgets/Impact
   */
  priority: number; 
  evaluate(context: EvaluationContext): Promise<EvaluationResult>;
}
