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
    impact: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>>;
    argumentsMetadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    timestamp: z.ZodOptional<z.ZodString>;
    sequenceNumber: z.ZodOptional<z.ZodNumber>;
    /** Data provenance attached to this action's payload */
    provenance: z.ZodOptional<z.ZodObject<{
        labels: z.ZodArray<z.ZodEnum<["TRUSTED", "UNTRUSTED", "PII", "INTERNAL_ONLY", "SECRET", "USER_PROVIDED", "EXTERNAL"]>, "many">;
        source: z.ZodOptional<z.ZodString>;
        sourceActionId: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        labels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        source?: string | undefined;
        sourceActionId?: string | undefined;
        timestamp?: string | undefined;
    }, {
        labels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        source?: string | undefined;
        sourceActionId?: string | undefined;
        timestamp?: string | undefined;
    }>>;
    /** Where this action's output will go */
    destination: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["INTERNAL_DATABASE", "INTERNAL_API", "EXTERNAL_API", "EXTERNAL_WEBHOOK", "EMAIL", "PUBLIC_WEB", "FILE_SYSTEM", "PRODUCTION_INFRASTRUCTURE", "MCP_TOOL", "SAAS_TOOL", "UNKNOWN"]>;
        identifier: z.ZodString;
        isExternal: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: "INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN";
        identifier: string;
        isExternal: boolean;
    }, {
        type: "INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN";
        identifier: string;
        isExternal?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    system: string;
    operation: string;
    resource: string;
    timestamp?: string | undefined;
    id?: string | undefined;
    executionId?: string | undefined;
    agentId?: string | undefined;
    resourceType?: string | undefined;
    capability?: string | undefined;
    sensitivity?: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED" | undefined;
    impact?: "LOW" | "MEDIUM" | "HIGH" | undefined;
    argumentsMetadata?: Record<string, any> | undefined;
    sequenceNumber?: number | undefined;
    provenance?: {
        labels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        source?: string | undefined;
        sourceActionId?: string | undefined;
        timestamp?: string | undefined;
    } | undefined;
    destination?: {
        type: "INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN";
        identifier: string;
        isExternal: boolean;
    } | undefined;
}, {
    system: string;
    operation: string;
    resource: string;
    timestamp?: string | undefined;
    id?: string | undefined;
    executionId?: string | undefined;
    agentId?: string | undefined;
    resourceType?: string | undefined;
    capability?: string | undefined;
    sensitivity?: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED" | undefined;
    impact?: "LOW" | "MEDIUM" | "HIGH" | undefined;
    argumentsMetadata?: Record<string, any> | undefined;
    sequenceNumber?: number | undefined;
    provenance?: {
        labels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        source?: string | undefined;
        sourceActionId?: string | undefined;
        timestamp?: string | undefined;
    } | undefined;
    destination?: {
        type: "INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN";
        identifier: string;
        isExternal?: boolean | undefined;
    } | undefined;
}>;
export type Action = z.infer<typeof ActionSchema>;
export declare const RawActionRequestSchema: z.ZodObject<{
    system: z.ZodString;
    operation: z.ZodString;
    resource: z.ZodString;
    capability: z.ZodOptional<z.ZodString>;
    arguments: z.ZodRecord<z.ZodString, z.ZodAny>;
    /** Optional provenance labels the agent declares on this action's data */
    provenanceLabels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    /** Optional provenance source */
    provenanceSource: z.ZodOptional<z.ZodString>;
    destinationType: z.ZodOptional<z.ZodString>;
    destinationIdentifier: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    system: string;
    operation: string;
    resource: string;
    arguments: Record<string, any>;
    capability?: string | undefined;
    provenanceLabels?: string[] | undefined;
    provenanceSource?: string | undefined;
    destinationType?: string | undefined;
    destinationIdentifier?: string | undefined;
}, {
    system: string;
    operation: string;
    resource: string;
    arguments: Record<string, any>;
    capability?: string | undefined;
    provenanceLabels?: string[] | undefined;
    provenanceSource?: string | undefined;
    destinationType?: string | undefined;
    destinationIdentifier?: string | undefined;
}>;
export type RawActionRequest = z.infer<typeof RawActionRequestSchema>;
