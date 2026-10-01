import { z } from "zod";
export declare const ExecutionContractSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    executionId: z.ZodOptional<z.ZodString>;
    objective: z.ZodString;
    expectedActions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    allowedSystems: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    allowedCapabilities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    restrictedResources: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    maxActions: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    maxExternalWrites: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    /** Capabilities that are strictly forbidden, regardless of other rules */
    forbiddenCapabilities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Regex patterns for resources that are strictly forbidden */
    forbiddenResourcePatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Contract-specific information flow rules */
    flowRules: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        sourceLabels: z.ZodArray<z.ZodEnum<["TRUSTED", "UNTRUSTED", "PII", "INTERNAL_ONLY", "SECRET", "USER_PROVIDED", "EXTERNAL"]>, "many">;
        destinationTypes: z.ZodArray<z.ZodEnum<["INTERNAL_DATABASE", "INTERNAL_API", "EXTERNAL_API", "EXTERNAL_WEBHOOK", "EMAIL", "PUBLIC_WEB", "FILE_SYSTEM", "PRODUCTION_INFRASTRUCTURE", "MCP_TOOL", "SAAS_TOOL", "UNKNOWN"]>, "many">;
        decision: z.ZodEnum<["ALLOW", "ASK", "BLOCK"]>;
        reason: z.ZodString;
        priority: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        sourceLabels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        destinationTypes: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[];
        decision: "ALLOW" | "ASK" | "BLOCK";
        reason: string;
        priority: number;
        id?: string | undefined;
    }, {
        sourceLabels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        destinationTypes: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[];
        decision: "ALLOW" | "ASK" | "BLOCK";
        reason: string;
        id?: string | undefined;
        priority?: number | undefined;
    }>, "many">>;
    /** Contract-specific no-go patterns */
    noGoPatterns: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        type: z.ZodEnum<["SEQUENCE", "AFTER", "PROVENANCE_FLOW"]>;
        precedingCapability: z.ZodOptional<z.ZodString>;
        followingCapability: z.ZodOptional<z.ZodString>;
        sourceLabels: z.ZodOptional<z.ZodArray<z.ZodEnum<["TRUSTED", "UNTRUSTED", "PII", "INTERNAL_ONLY", "SECRET", "USER_PROVIDED", "EXTERNAL"]>, "many">>;
        destinationTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["INTERNAL_DATABASE", "INTERNAL_API", "EXTERNAL_API", "EXTERNAL_WEBHOOK", "EMAIL", "PUBLIC_WEB", "FILE_SYSTEM", "PRODUCTION_INFRASTRUCTURE", "MCP_TOOL", "SAAS_TOOL", "UNKNOWN"]>, "many">>;
        decision: z.ZodDefault<z.ZodEnum<["ALLOW", "ASK", "BLOCK"]>>;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "SEQUENCE" | "AFTER" | "PROVENANCE_FLOW";
        decision: "ALLOW" | "ASK" | "BLOCK";
        reason: string;
        name: string;
        id?: string | undefined;
        sourceLabels?: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[] | undefined;
        destinationTypes?: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[] | undefined;
        precedingCapability?: string | undefined;
        followingCapability?: string | undefined;
    }, {
        type: "SEQUENCE" | "AFTER" | "PROVENANCE_FLOW";
        reason: string;
        name: string;
        id?: string | undefined;
        sourceLabels?: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[] | undefined;
        destinationTypes?: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[] | undefined;
        decision?: "ALLOW" | "ASK" | "BLOCK" | undefined;
        precedingCapability?: string | undefined;
        followingCapability?: string | undefined;
    }>, "many">>;
    /** General provenance constraints (e.g. "no PII allowed in this execution") */
    forbiddenProvenance: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Conditions under which execution should automatically terminate */
    terminationConditions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    flowRules: {
        sourceLabels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        destinationTypes: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[];
        decision: "ALLOW" | "ASK" | "BLOCK";
        reason: string;
        priority: number;
        id?: string | undefined;
    }[];
    noGoPatterns: {
        type: "SEQUENCE" | "AFTER" | "PROVENANCE_FLOW";
        decision: "ALLOW" | "ASK" | "BLOCK";
        reason: string;
        name: string;
        id?: string | undefined;
        sourceLabels?: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[] | undefined;
        destinationTypes?: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[] | undefined;
        precedingCapability?: string | undefined;
        followingCapability?: string | undefined;
    }[];
    forbiddenCapabilities: string[];
    objective: string;
    expectedActions: string[];
    allowedSystems: string[];
    allowedCapabilities: string[];
    restrictedResources: string[];
    forbiddenResourcePatterns: string[];
    forbiddenProvenance: string[];
    terminationConditions: string[];
    id?: string | undefined;
    executionId?: string | undefined;
    maxActions?: number | null | undefined;
    maxExternalWrites?: number | null | undefined;
}, {
    objective: string;
    id?: string | undefined;
    executionId?: string | undefined;
    flowRules?: {
        sourceLabels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        destinationTypes: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[];
        decision: "ALLOW" | "ASK" | "BLOCK";
        reason: string;
        id?: string | undefined;
        priority?: number | undefined;
    }[] | undefined;
    noGoPatterns?: {
        type: "SEQUENCE" | "AFTER" | "PROVENANCE_FLOW";
        reason: string;
        name: string;
        id?: string | undefined;
        sourceLabels?: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[] | undefined;
        destinationTypes?: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[] | undefined;
        decision?: "ALLOW" | "ASK" | "BLOCK" | undefined;
        precedingCapability?: string | undefined;
        followingCapability?: string | undefined;
    }[] | undefined;
    forbiddenCapabilities?: string[] | undefined;
    expectedActions?: string[] | undefined;
    allowedSystems?: string[] | undefined;
    allowedCapabilities?: string[] | undefined;
    restrictedResources?: string[] | undefined;
    maxActions?: number | null | undefined;
    maxExternalWrites?: number | null | undefined;
    forbiddenResourcePatterns?: string[] | undefined;
    forbiddenProvenance?: string[] | undefined;
    terminationConditions?: string[] | undefined;
}>;
export type ExecutionContract = z.infer<typeof ExecutionContractSchema>;
