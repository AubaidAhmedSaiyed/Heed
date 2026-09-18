import { z } from "zod";
export declare const ExecutionContractSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    executionId: z.ZodOptional<z.ZodString>;
    objective: z.ZodString;
    expectedActions: z.ZodArray<z.ZodString, "many">;
    allowedSystems: z.ZodArray<z.ZodString, "many">;
    allowedCapabilities: z.ZodArray<z.ZodString, "many">;
    restrictedResources: z.ZodArray<z.ZodString, "many">;
    maxActions: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    maxExternalWrites: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    objective: string;
    expectedActions: string[];
    allowedSystems: string[];
    allowedCapabilities: string[];
    restrictedResources: string[];
    id?: string | undefined;
    executionId?: string | undefined;
    maxActions?: number | null | undefined;
    maxExternalWrites?: number | null | undefined;
}, {
    objective: string;
    expectedActions: string[];
    allowedSystems: string[];
    allowedCapabilities: string[];
    restrictedResources: string[];
    id?: string | undefined;
    executionId?: string | undefined;
    maxActions?: number | null | undefined;
    maxExternalWrites?: number | null | undefined;
}>;
export type ExecutionContract = z.infer<typeof ExecutionContractSchema>;
