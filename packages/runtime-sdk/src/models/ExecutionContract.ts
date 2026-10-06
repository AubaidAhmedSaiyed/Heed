import { z } from "zod";
import { FlowRuleSchema, NoGoPatternSchema } from "./Policy";

export const ExecutionContractSchema = z.object({
  id: z.string().uuid().optional(),
  executionId: z.string().uuid().optional(),
  objective: z.string(),
  
  expectedActions: z.array(z.string()).default([]),
  allowedSystems: z.array(z.string()).default([]),
  allowedCapabilities: z.array(z.string()).default([]),
  restrictedResources: z.array(z.string()).default([]),
  
  maxActions: z.number().int().positive().optional().nullable(),
  maxExternalWrites: z.number().int().nonnegative().optional().nullable(),

  // ─── Phase 4 additions ─────────────────────────────────────
  
  /** Capabilities that are strictly forbidden, regardless of other rules */
  forbiddenCapabilities: z.array(z.string()).default([]),
  
  /** Regex patterns for resources that are strictly forbidden */
  forbiddenResourcePatterns: z.array(z.string()).default([]),
  
  /** Contract-specific information flow rules */
  flowRules: z.array(FlowRuleSchema).default([]),
  
  /** Contract-specific no-go patterns */
  noGoPatterns: z.array(NoGoPatternSchema).default([]),
  
  /** General provenance constraints (e.g. "no PII allowed in this execution") */
  forbiddenProvenance: z.array(z.string()).default([]),
  
  /** Conditions under which execution should automatically terminate */
  terminationConditions: z.array(z.string()).default([]),
});

export type ExecutionContract = z.infer<typeof ExecutionContractSchema>;
export type ExecutionContractInput = z.input<typeof ExecutionContractSchema>;
