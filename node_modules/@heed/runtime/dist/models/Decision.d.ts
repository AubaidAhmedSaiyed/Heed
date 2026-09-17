import { z } from "zod";
export declare const DecisionStatusSchema: z.ZodEnum<["ALLOW", "ASK", "BLOCK"]>;
export type DecisionStatus = z.infer<typeof DecisionStatusSchema>;
export declare const DecisionSchema: z.ZodObject<{
    decision: z.ZodEnum<["ALLOW", "ASK", "BLOCK"]>;
    riskScore: z.ZodNumber;
    deviationScore: z.ZodNumber;
    reasons: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    decision: "ALLOW" | "ASK" | "BLOCK";
    riskScore: number;
    deviationScore: number;
    reasons: string[];
}, {
    decision: "ALLOW" | "ASK" | "BLOCK";
    riskScore: number;
    deviationScore: number;
    reasons: string[];
}>;
export type Decision = z.infer<typeof DecisionSchema>;
