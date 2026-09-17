import { z } from "zod";

export const DecisionStatusSchema = z.enum(["ALLOW", "ASK", "BLOCK"]);
export type DecisionStatus = z.infer<typeof DecisionStatusSchema>;

export const DecisionSchema = z.object({
  decision: DecisionStatusSchema,
  riskScore: z.number().min(0).max(100),
  deviationScore: z.number().min(0).max(100),
  reasons: z.array(z.string())
});

export type Decision = z.infer<typeof DecisionSchema>;
