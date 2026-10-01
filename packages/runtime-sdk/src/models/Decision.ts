import { z } from "zod";

export const DecisionStatusSchema = z.enum([
  "ALLOW", 
  "ASK", 
  "BLOCK",
  // Phase 4 additions:
  "ALLOW_CONSTRAINED", 
  "BOUND_APPROVAL"
]);
export type DecisionStatus = z.infer<typeof DecisionStatusSchema>;

export const DecisionSchema = z.object({
  decision: DecisionStatusSchema,
  riskScore: z.number().min(0).max(100),
  deviationScore: z.number().min(0).max(100),
  reasons: z.array(z.string()),

  // ─── Phase 4 additions ─────────────────────────────────────
  /** IDs or names of policies that matched and contributed to this decision */
  matchedPolicies: z.array(z.string()).optional(),

  /** For ALLOW_CONSTRAINED: specific runtime constraints to apply (e.g. timeout, rate limit) */
  constraints: z.record(z.any()).optional(),

  /** For BOUND_APPROVAL: requirements for the approval (e.g. required authority) */
  approvalRequirements: z.record(z.any()).optional(),

  /** Evidence metadata for auditing (e.g. hashes, timestamps) */
  evidenceMetadata: z.record(z.any()).optional(),
});

export type Decision = z.infer<typeof DecisionSchema>;
