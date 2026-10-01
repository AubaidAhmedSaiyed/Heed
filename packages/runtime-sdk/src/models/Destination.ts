import { z } from "zod";

// ─── Destination Types ───────────────────────────────────────────
export const DestinationTypeSchema = z.enum([
  "INTERNAL_DATABASE",
  "INTERNAL_API",
  "EXTERNAL_API",
  "EXTERNAL_WEBHOOK",
  "EMAIL",
  "PUBLIC_WEB",
  "FILE_SYSTEM",
  "PRODUCTION_INFRASTRUCTURE",
  "MCP_TOOL",
  "SAAS_TOOL",
  "UNKNOWN",
]);
export type DestinationType = z.infer<typeof DestinationTypeSchema>;

// ─── Destination ─────────────────────────────────────────────────
export const DestinationSchema = z.object({
  /** The category of destination */
  type: DestinationTypeSchema,

  /** Identifier (e.g. hostname, DB name, service name) */
  identifier: z.string(),

  /** Whether this destination is considered internal or external */
  isExternal: z.boolean().default(false),
});
export type Destination = z.infer<typeof DestinationSchema>;

// ─── Helpers ─────────────────────────────────────────────────────

const EXTERNAL_TYPES: Set<DestinationType> = new Set([
  "EXTERNAL_API",
  "EXTERNAL_WEBHOOK",
  "EMAIL",
  "PUBLIC_WEB",
  "SAAS_TOOL",
]);

export function isExternalDestination(dest: Destination): boolean {
  return dest.isExternal || EXTERNAL_TYPES.has(dest.type);
}
