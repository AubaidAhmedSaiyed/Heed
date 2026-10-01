import { z } from "zod";

// ─── Authority Types ─────────────────────────────────────────────
export const AuthorityTypeSchema = z.enum([
  "USER",
  "SERVICE",
  "ORGANIZATION",
  "SYSTEM",
]);
export type AuthorityType = z.infer<typeof AuthorityTypeSchema>;

// ─── Authority Context ───────────────────────────────────────────
export const AuthorityContextSchema = z.object({
  /** Who is ultimately responsible for this execution */
  type: AuthorityTypeSchema,

  /** Unique identifier for the authority (user ID, service account, etc.) */
  id: z.string(),

  /** Optional display name */
  name: z.string().optional(),

  /** Optional delegation chain: who delegated to whom */
  delegationChain: z.array(z.object({
    type: AuthorityTypeSchema,
    id: z.string(),
    name: z.string().optional(),
  })).optional(),
});
export type AuthorityContext = z.infer<typeof AuthorityContextSchema>;
