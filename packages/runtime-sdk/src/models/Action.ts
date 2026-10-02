import { z } from "zod";
import { ProvenanceSchema } from "./Provenance";
import { DestinationSchema } from "./Destination";

export const SensitivitySchema = z.enum(["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]);
export type Sensitivity = z.infer<typeof SensitivitySchema>;

export const ActionSchema = z.object({
  id: z.string().uuid().optional(),
  executionId: z.string().uuid().optional(),
  agentId: z.string().optional(),
  system: z.string(),
  operation: z.string(),
  resource: z.string(),
  resourceType: z.string().optional(),
  capability: z.string().optional(),
  sensitivity: SensitivitySchema.optional(),
  impact: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  argumentsMetadata: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
  sequenceNumber: z.number().optional(),

  // ─── Phase 4 additions ─────────────────────────────────────
  /** Optional idempotency key to prevent duplicate action side-effects on retries */
  idempotencyKey: z.string().optional(),

  /** Data provenance attached to this action's payload */
  provenance: ProvenanceSchema.optional(),

  /** Where this action's output will go */
  destination: DestinationSchema.optional(),
});

export type Action = z.infer<typeof ActionSchema>;

// Raw action requested by the agent before normalization/redaction
export const RawActionRequestSchema = z.object({
  system: z.string(),
  operation: z.string(),
  resource: z.string(),
  capability: z.string().optional(),
  arguments: z.record(z.any()),

  // ─── Phase 4 additions ─────────────────────────────────────
  /** Optional idempotency key to prevent duplicate action side-effects on retries */
  idempotencyKey: z.string().optional(),

  /** Optional provenance labels the agent declares on this action's data */
  provenanceLabels: z.array(z.string()).optional(),

  /** Optional provenance source */
  provenanceSource: z.string().optional(),

  destinationType: z.string().optional(),
  destinationIdentifier: z.string().optional(),
});

export type RawActionRequest = z.infer<typeof RawActionRequestSchema>;
