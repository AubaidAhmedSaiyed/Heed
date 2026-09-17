import { Action, ExecutionContract } from "@heed/runtime";

export interface EvaluationContext {
  action: Action;
  contract?: ExecutionContract;
  objective?: string;
  previousActions?: Action[];
  behaviorProfile?: any; // To be typed later
}

export interface EvaluationResult {
  score: number; // Positive is risky/deviating, negative is safe/expected
  reasons: string[];
}

export interface Evaluator {
  name: string;
  evaluate(context: EvaluationContext): Promise<EvaluationResult>;
}
