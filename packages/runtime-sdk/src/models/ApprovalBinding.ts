import { z } from "zod";
import { ProvenanceLabelSchema } from "./Provenance";

// ─── Approval Binding ────────────────────────────────────────────
// Cryptographically/structurally binds an approval to the exact action.
// Cannot be reused, swapped, or applied to modified arguments.

export const ApprovalBindingSchema = z.object({
  /** Unique approval ID */
  id: z.string().uuid(),

  /** The execution this approval is bound to */
  executionId: z.string(),

  /** The action event this approval is bound to */
  actionEventId: z.string(),

  /** System requested */
  system: z.string(),

  /** Operation requested */
  operation: z.string(),

  /** Bound capability */
  capability: z.string(),

  /** Bound resource */
  resource: z.string(),

  /** SHA-256 hash of the canonicalized action arguments */
  argumentsHash: z.string(),

  /** Hash or representation of the provenance state */
  provenanceHash: z.string(),

  /** Hash or string representation of the destination */
  destinationHash: z.string(),

  /** Exact policy snapshot this was evaluated against */
  policySnapshotId: z.string(),

  /** When the approval expires (ISO datetime) */
  expiresAt: z.string().datetime(),

  /** Whether this approval has been consumed */
  consumed: z.boolean().default(false),

  /** When the approval was consumed */
  consumedAt: z.string().datetime().optional(),

  status: z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED", "INVALIDATED"]),

  /** Who approved it */
  approvedBy: z.string().optional(),

  /** When it was created */
  createdAt: z.string().datetime(),
});
export type ApprovalBinding = z.infer<typeof ApprovalBindingSchema>;

// ─── Helpers ─────────────────────────────────────────────────────

/** Canonicalize action arguments for hashing. Deterministic JSON. */
export function canonicalizeArguments(args: Record<string, unknown>): string {
  const sorted = Object.keys(args).sort().reduce((acc, key) => {
    acc[key] = args[key];
    return acc;
  }, {} as Record<string, unknown>);
  return JSON.stringify(sorted);
}

/** Compute SHA-256 hash of a string (works in Node.js) */
export async function hashArguments(canonical: string): Promise<string> {
  const { createHash } = await import("crypto");
  return createHash("sha256").update(canonical).digest("hex");
}

/** Validate that an approval binding matches the current action */
export function validateApprovalBinding(
  binding: ApprovalBinding,
  executionId: string,
  system: string,
  operation: string,
  capability: string,
  resource: string,
  argumentsHash: string,
  provenanceHash: string,
  destinationHash: string,
  policySnapshotId: string
): { valid: boolean; reason?: string } {
  if (binding.consumed) {
    return { valid: false, reason: "Approval has already been consumed (single-use)" };
  }
  if (binding.status !== "APPROVED") {
    return { valid: false, reason: `Approval status is ${binding.status}` };
  }
  if (new Date(binding.expiresAt) < new Date()) {
    return { valid: false, reason: "Approval has expired" };
  }
  if (binding.executionId !== executionId) {
    return { valid: false, reason: "Approval is bound to a different execution" };
  }
  if (binding.system !== system || binding.operation !== operation) {
    return { valid: false, reason: "Approval is bound to a different system/operation" };
  }
  if (binding.capability !== capability) {
    return { valid: false, reason: `Approval is bound to capability '${binding.capability}', not '${capability}'` };
  }
  if (binding.resource !== resource) {
    return { valid: false, reason: `Approval is bound to resource '${binding.resource}', not '${resource}'` };
  }
  if (binding.argumentsHash !== argumentsHash) {
    return { valid: false, reason: "Action arguments have been modified since approval was granted" };
  }
  if (binding.provenanceHash !== provenanceHash) {
    return { valid: false, reason: "Provenance context has mutated since approval" };
  }
  if (binding.destinationHash !== destinationHash) {
    return { valid: false, reason: "Destination has mutated since approval" };
  }
  if (binding.policySnapshotId !== policySnapshotId) {
    return { valid: false, reason: "Policy snapshot has changed since approval" };
  }
  return { valid: true };
}
