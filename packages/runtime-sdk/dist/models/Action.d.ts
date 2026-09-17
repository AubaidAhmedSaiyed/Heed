import { z } from "zod";
export declare const SensitivitySchema: z.ZodEnum<["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]>;
export type Sensitivity = z.infer<typeof SensitivitySchema>;
export declare const ActionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    executionId: z.ZodOptional<z.ZodString>;
    agentId: z.ZodOptional<z.ZodString>;
    system: z.ZodString;
    operation: z.ZodString;
    resource: z.ZodString;
    resourceType: z.ZodOptional<z.ZodString>;
    capability: z.ZodOptional<z.ZodString>;
    sensitivity: z.ZodOptional<z.ZodEnum<["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]>>;
    argumentsMetadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    timestamp: z.ZodOptional<z.ZodString>;
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    system: string;
    operation: string;
    resource: string;
    id?: string | undefined;
    executionId?: string | undefined;
    agentId?: string | undefined;
    resourceType?: string | undefined;
    capability?: string | undefined;
    sensitivity?: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED" | undefined;
    argumentsMetadata?: Record<string, any> | undefined;
    timestamp?: string | undefined;
    sequenceNumber?: number | undefined;
}, {
    system: string;
    operation: string;
    resource: string;
    id?: string | undefined;
    executionId?: string | undefined;
    agentId?: string | undefined;
    resourceType?: string | undefined;
    capability?: string | undefined;
    sensitivity?: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED" | undefined;
    argumentsMetadata?: Record<string, any> | undefined;
    timestamp?: string | undefined;
    sequenceNumber?: number | undefined;
}>;
export type Action = z.infer<typeof ActionSchema>;
export declare const RawActionRequestSchema: z.ZodObject<{
    system: z.ZodString;
    operation: z.ZodString;
    resource: z.ZodString;
    capability: z.ZodOptional<z.ZodString>;
    arguments: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    system: string;
    operation: string;
    resource: string;
    arguments: Record<string, any>;
    capability?: string | undefined;
}, {
    system: string;
    operation: string;
    resource: string;
    arguments: Record<string, any>;
    capability?: string | undefined;
}>;
export type RawActionRequest = z.infer<typeof RawActionRequestSchema>;
