import { z } from "zod";

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
  capability: z.string().optional(), // New capability field
  sensitivity: SensitivitySchema.optional(),
  argumentsMetadata: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
  sequenceNumber: z.number().optional()
});

export type Action = z.infer<typeof ActionSchema>;

// Raw action requested by the agent before normalization/redaction
export const RawActionRequestSchema = z.object({
  system: z.string(),
  operation: z.string(),
  resource: z.string(),
  capability: z.string().optional(),
  arguments: z.record(z.any())
});

export type RawActionRequest = z.infer<typeof RawActionRequestSchema>;
