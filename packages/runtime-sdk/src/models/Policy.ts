import { z } from "zod";
import { ProvenanceLabelSchema } from "./Provenance";
import { DestinationTypeSchema } from "./Destination";

// ─── Decision Types for Flow Rules ──────────────────────────────
const FlowDecisionSchema = z.enum(["ALLOW", "ASK", "BLOCK"]);

// ─── Information Flow Rule ───────────────────────────────────────
// A flow rule says: data with these provenance labels going to this
// destination type should produce this decision.
export const FlowRuleSchema = z.object({
  id: z.string().optional(),

  /** Provenance labels that trigger this rule (ANY match triggers) */
  sourceLabels: z.array(ProvenanceLabelSchema).min(1),

  /** Destination types this rule applies to (ANY match triggers) */
  destinationTypes: z.array(DestinationTypeSchema).min(1),

  /** The decision to produce when this rule matches */
  decision: FlowDecisionSchema,

  /** Human-readable reason */
  reason: z.string(),

  /** Priority: lower number = higher priority (evaluated first) */
  priority: z.number().int().default(100),
});
export type FlowRule = z.infer<typeof FlowRuleSchema>;

// ─── No-Go Trajectory Pattern ────────────────────────────────────
// Structural patterns that should never occur in a trajectory.
export const NoGoPatternSchema = z.object({
  id: z.string().optional(),

  /** Human-readable name */
  name: z.string(),

  /** The pattern type */
  type: z.enum([
    "SEQUENCE",          // A followed by B
    "AFTER",             // A cannot occur after B  
    "PROVENANCE_FLOW",   // provenance X → destination Y
  ]),

  /** For SEQUENCE/AFTER: the capability or operation that precedes */
  precedingCapability: z.string().optional(),

  /** For SEQUENCE/AFTER: the capability or operation that follows */
  followingCapability: z.string().optional(),

  /** For PROVENANCE_FLOW: source provenance labels */
  sourceLabels: z.array(ProvenanceLabelSchema).optional(),

  /** For PROVENANCE_FLOW: destination types */
  destinationTypes: z.array(DestinationTypeSchema).optional(),

  /** Whether this should BLOCK or ASK */
  decision: FlowDecisionSchema.default("BLOCK"),

  /** Human-readable reason */
  reason: z.string(),
});
export type NoGoPattern = z.infer<typeof NoGoPatternSchema>;

// ─── Policy ──────────────────────────────────────────────────────
export const PolicySchema = z.object({
  /** Unique policy ID */
  id: z.string(),

  /** Monotonically increasing version */
  version: z.number().int().positive(),

  /** Human-readable name */
  name: z.string(),

  /** Description */
  description: z.string().optional(),

  /** Information flow rules */
  flowRules: z.array(FlowRuleSchema).default([]),

  /** No-go trajectory patterns */
  noGoPatterns: z.array(NoGoPatternSchema).default([]),

  /** Forbidden capabilities (hard deny) */
  forbiddenCapabilities: z.array(z.string()).default([]),

  /** Capabilities that always require BOUND_APPROVAL */
  boundApprovalCapabilities: z.array(z.string()).default([]),

  /** Whether this policy is active */
  active: z.boolean().default(true),

  /** When this policy was created */
  createdAt: z.string().datetime().optional(),
});
export type Policy = z.infer<typeof PolicySchema>;

// ─── Policy validation ──────────────────────────────────────────

export function validatePolicy(policy: unknown): { valid: boolean; errors: string[] } {
  const result = PolicySchema.safeParse(policy);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`),
  };
}
