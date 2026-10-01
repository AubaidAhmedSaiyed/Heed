import { z } from "zod";
export declare const DecisionStatusSchema: z.ZodEnum<["ALLOW", "ASK", "BLOCK", "ALLOW_CONSTRAINED", "BOUND_APPROVAL"]>;
export type DecisionStatus = z.infer<typeof DecisionStatusSchema>;
export declare const DecisionSchema: z.ZodObject<{
    decision: z.ZodEnum<["ALLOW", "ASK", "BLOCK", "ALLOW_CONSTRAINED", "BOUND_APPROVAL"]>;
    riskScore: z.ZodNumber;
    deviationScore: z.ZodNumber;
    reasons: z.ZodArray<z.ZodString, "many">;
    /** IDs or names of policies that matched and contributed to this decision */
    matchedPolicies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    /** For ALLOW_CONSTRAINED: specific runtime constraints to apply (e.g. timeout, rate limit) */
    constraints: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    /** For BOUND_APPROVAL: requirements for the approval (e.g. required authority) */
    approvalRequirements: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    /** Evidence metadata for auditing (e.g. hashes, timestamps) */
    evidenceMetadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    decision: "ALLOW" | "ASK" | "BLOCK" | "ALLOW_CONSTRAINED" | "BOUND_APPROVAL";
    riskScore: number;
    deviationScore: number;
    reasons: string[];
    matchedPolicies?: string[] | undefined;
    constraints?: Record<string, any> | undefined;
    approvalRequirements?: Record<string, any> | undefined;
    evidenceMetadata?: Record<string, any> | undefined;
}, {
    decision: "ALLOW" | "ASK" | "BLOCK" | "ALLOW_CONSTRAINED" | "BOUND_APPROVAL";
    riskScore: number;
    deviationScore: number;
    reasons: string[];
    matchedPolicies?: string[] | undefined;
    constraints?: Record<string, any> | undefined;
    approvalRequirements?: Record<string, any> | undefined;
    evidenceMetadata?: Record<string, any> | undefined;
}>;
export type Decision = z.infer<typeof DecisionSchema>;
