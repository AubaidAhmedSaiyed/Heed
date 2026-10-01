import { z } from "zod";

// ─── Provenance Labels ───────────────────────────────────────────
export const ProvenanceLabelSchema = z.enum([
  "TRUSTED",
  "UNTRUSTED",
  "PII",
  "INTERNAL_ONLY",
  "SECRET",
  "USER_PROVIDED",
  "EXTERNAL",
]);
export type ProvenanceLabel = z.infer<typeof ProvenanceLabelSchema>;

// ─── Provenance Metadata ─────────────────────────────────────────
export const ProvenanceSchema = z.object({
  /** One or more provenance labels. A single datum can carry multiple. */
  labels: z.array(ProvenanceLabelSchema).min(1),

  /** Human-readable source identifier (e.g. "customer_database", "user_input") */
  source: z.string().optional(),

  /** UUID of the action event that produced this data, if any */
  sourceActionId: z.string().uuid().optional(),

  /** When the provenance was assigned */
  timestamp: z.string().datetime().optional(),
});
export type Provenance = z.infer<typeof ProvenanceSchema>;

// ─── Provenance Context ──────────────────────────────────────────
// Tracks all provenance labels that are active in the current execution.
// As data flows through tools, provenance accumulates.
export const ProvenanceContextSchema = z.object({
  /** All provenance labels currently active in this execution */
  activeLabels: z.array(ProvenanceLabelSchema),

  /** Individual provenance entries that contributed */
  entries: z.array(ProvenanceSchema),
});
export type ProvenanceContext = z.infer<typeof ProvenanceContextSchema>;

// ─── Helpers ─────────────────────────────────────────────────────

/** Union two provenance contexts: labels accumulate, entries merge */
export function mergeProvenance(a: ProvenanceContext, b: ProvenanceContext): ProvenanceContext {
  const mergedLabels = Array.from(new Set([...a.activeLabels, ...b.activeLabels]));
  const mergedEntries = [...a.entries, ...b.entries];
  return { activeLabels: mergedLabels as ProvenanceLabel[], entries: mergedEntries };
}

/** Create a fresh provenance context from a single entry */
export function createProvenance(labels: ProvenanceLabel[], source?: string): ProvenanceContext {
  const entry: Provenance = {
    labels,
    source,
    timestamp: new Date().toISOString(),
  };
  return { activeLabels: [...labels], entries: [entry] };
}

/** Propagate: add new labels into an existing context */
export function propagateProvenance(
  existing: ProvenanceContext,
  newLabels: ProvenanceLabel[],
  source?: string,
  sourceActionId?: string
): ProvenanceContext {
  const entry: Provenance = {
    labels: newLabels,
    source,
    sourceActionId,
    timestamp: new Date().toISOString(),
  };
  return {
    activeLabels: Array.from(new Set([...existing.activeLabels, ...newLabels])) as ProvenanceLabel[],
    entries: [...existing.entries, entry],
  };
}

/** Check if a provenance context contains any of the given labels */
export function hasAnyLabel(ctx: ProvenanceContext, labels: ProvenanceLabel[]): boolean {
  return labels.some(l => ctx.activeLabels.includes(l));
}

/** Empty provenance context */
export function emptyProvenance(): ProvenanceContext {
  return { activeLabels: [], entries: [] };
}
