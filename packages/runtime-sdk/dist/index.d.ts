import { z } from 'zod';

declare const SensitivitySchema: z.ZodEnum<["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]>;
type Sensitivity = z.infer<typeof SensitivitySchema>;
declare const ActionSchema: z.ZodObject<{
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
    /** Optional idempotency key to prevent duplicate action side-effects on retries */
    idempotencyKey: z.ZodOptional<z.ZodString>;
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
    capability?: string | undefined;
    idempotencyKey?: string | undefined;
    agentId?: string | undefined;
    resourceType?: string | undefined;
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
    capability?: string | undefined;
    idempotencyKey?: string | undefined;
    agentId?: string | undefined;
    resourceType?: string | undefined;
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
type Action = z.infer<typeof ActionSchema>;
declare const RawActionRequestSchema: z.ZodObject<{
    system: z.ZodString;
    operation: z.ZodString;
    resource: z.ZodString;
    capability: z.ZodOptional<z.ZodString>;
    arguments: z.ZodRecord<z.ZodString, z.ZodAny>;
    /** Optional idempotency key to prevent duplicate action side-effects on retries */
    idempotencyKey: z.ZodOptional<z.ZodString>;
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
    idempotencyKey?: string | undefined;
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
    idempotencyKey?: string | undefined;
    provenanceLabels?: string[] | undefined;
    provenanceSource?: string | undefined;
    destinationType?: string | undefined;
    destinationIdentifier?: string | undefined;
}>;
type RawActionRequest = z.infer<typeof RawActionRequestSchema>;

declare const ProvenanceLabelSchema: z.ZodEnum<["TRUSTED", "UNTRUSTED", "PII", "INTERNAL_ONLY", "SECRET", "USER_PROVIDED", "EXTERNAL"]>;
type ProvenanceLabel = z.infer<typeof ProvenanceLabelSchema>;
declare const ProvenanceSchema: z.ZodObject<{
    /** One or more provenance labels. A single datum can carry multiple. */
    labels: z.ZodArray<z.ZodEnum<["TRUSTED", "UNTRUSTED", "PII", "INTERNAL_ONLY", "SECRET", "USER_PROVIDED", "EXTERNAL"]>, "many">;
    /** Human-readable source identifier (e.g. "customer_database", "user_input") */
    source: z.ZodOptional<z.ZodString>;
    /** UUID of the action event that produced this data, if any */
    sourceActionId: z.ZodOptional<z.ZodString>;
    /** When the provenance was assigned */
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
}>;
type Provenance = z.infer<typeof ProvenanceSchema>;
declare const ProvenanceContextSchema: z.ZodObject<{
    /** All provenance labels currently active in this execution */
    activeLabels: z.ZodArray<z.ZodEnum<["TRUSTED", "UNTRUSTED", "PII", "INTERNAL_ONLY", "SECRET", "USER_PROVIDED", "EXTERNAL"]>, "many">;
    /** Individual provenance entries that contributed */
    entries: z.ZodArray<z.ZodObject<{
        /** One or more provenance labels. A single datum can carry multiple. */
        labels: z.ZodArray<z.ZodEnum<["TRUSTED", "UNTRUSTED", "PII", "INTERNAL_ONLY", "SECRET", "USER_PROVIDED", "EXTERNAL"]>, "many">;
        /** Human-readable source identifier (e.g. "customer_database", "user_input") */
        source: z.ZodOptional<z.ZodString>;
        /** UUID of the action event that produced this data, if any */
        sourceActionId: z.ZodOptional<z.ZodString>;
        /** When the provenance was assigned */
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
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    activeLabels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
    entries: {
        labels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        source?: string | undefined;
        sourceActionId?: string | undefined;
        timestamp?: string | undefined;
    }[];
}, {
    activeLabels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
    entries: {
        labels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        source?: string | undefined;
        sourceActionId?: string | undefined;
        timestamp?: string | undefined;
    }[];
}>;
type ProvenanceContext = z.infer<typeof ProvenanceContextSchema>;
/** Union two provenance contexts: labels accumulate, entries merge */
declare function mergeProvenance(a: ProvenanceContext, b: ProvenanceContext): ProvenanceContext;
/** Create a fresh provenance context from a single entry */
declare function createProvenance(labels: ProvenanceLabel[], source?: string): ProvenanceContext;
/** Propagate: add new labels into an existing context */
declare function propagateProvenance(existing: ProvenanceContext, newLabels: ProvenanceLabel[], source?: string, sourceActionId?: string): ProvenanceContext;
/** Check if a provenance context contains any of the given labels */
declare function hasAnyLabel(ctx: ProvenanceContext, labels: ProvenanceLabel[]): boolean;
/** Empty provenance context */
declare function emptyProvenance(): ProvenanceContext;

declare const ExecutionContractSchema: z.ZodObject<{
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
        decision: "BLOCK" | "ALLOW" | "ASK";
        reason: string;
        priority: number;
        id?: string | undefined;
    }, {
        sourceLabels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        destinationTypes: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[];
        decision: "BLOCK" | "ALLOW" | "ASK";
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
        decision: "BLOCK" | "ALLOW" | "ASK";
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
        decision?: "BLOCK" | "ALLOW" | "ASK" | undefined;
        precedingCapability?: string | undefined;
        followingCapability?: string | undefined;
    }>, "many">>;
    /** General provenance constraints (e.g. "no PII allowed in this execution") */
    forbiddenProvenance: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Conditions under which execution should automatically terminate */
    terminationConditions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    objective: string;
    expectedActions: string[];
    allowedSystems: string[];
    allowedCapabilities: string[];
    restrictedResources: string[];
    forbiddenCapabilities: string[];
    forbiddenResourcePatterns: string[];
    flowRules: {
        sourceLabels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        destinationTypes: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[];
        decision: "BLOCK" | "ALLOW" | "ASK";
        reason: string;
        priority: number;
        id?: string | undefined;
    }[];
    noGoPatterns: {
        type: "SEQUENCE" | "AFTER" | "PROVENANCE_FLOW";
        decision: "BLOCK" | "ALLOW" | "ASK";
        reason: string;
        name: string;
        id?: string | undefined;
        sourceLabels?: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[] | undefined;
        destinationTypes?: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[] | undefined;
        precedingCapability?: string | undefined;
        followingCapability?: string | undefined;
    }[];
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
    expectedActions?: string[] | undefined;
    allowedSystems?: string[] | undefined;
    allowedCapabilities?: string[] | undefined;
    restrictedResources?: string[] | undefined;
    maxActions?: number | null | undefined;
    maxExternalWrites?: number | null | undefined;
    forbiddenCapabilities?: string[] | undefined;
    forbiddenResourcePatterns?: string[] | undefined;
    flowRules?: {
        sourceLabels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        destinationTypes: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[];
        decision: "BLOCK" | "ALLOW" | "ASK";
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
        decision?: "BLOCK" | "ALLOW" | "ASK" | undefined;
        precedingCapability?: string | undefined;
        followingCapability?: string | undefined;
    }[] | undefined;
    forbiddenProvenance?: string[] | undefined;
    terminationConditions?: string[] | undefined;
}>;
type ExecutionContract = z.infer<typeof ExecutionContractSchema>;

declare const AuthorityTypeSchema: z.ZodEnum<["USER", "SERVICE", "ORGANIZATION", "SYSTEM"]>;
type AuthorityType = z.infer<typeof AuthorityTypeSchema>;
declare const AuthorityContextSchema: z.ZodObject<{
    /** Who is ultimately responsible for this execution */
    type: z.ZodEnum<["USER", "SERVICE", "ORGANIZATION", "SYSTEM"]>;
    /** Unique identifier for the authority (user ID, service account, etc.) */
    id: z.ZodString;
    /** Optional display name */
    name: z.ZodOptional<z.ZodString>;
    /** Optional delegation chain: who delegated to whom */
    delegationChain: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["USER", "SERVICE", "ORGANIZATION", "SYSTEM"]>;
        id: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "USER" | "SERVICE" | "ORGANIZATION" | "SYSTEM";
        id: string;
        name?: string | undefined;
    }, {
        type: "USER" | "SERVICE" | "ORGANIZATION" | "SYSTEM";
        id: string;
        name?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "USER" | "SERVICE" | "ORGANIZATION" | "SYSTEM";
    id: string;
    name?: string | undefined;
    delegationChain?: {
        type: "USER" | "SERVICE" | "ORGANIZATION" | "SYSTEM";
        id: string;
        name?: string | undefined;
    }[] | undefined;
}, {
    type: "USER" | "SERVICE" | "ORGANIZATION" | "SYSTEM";
    id: string;
    name?: string | undefined;
    delegationChain?: {
        type: "USER" | "SERVICE" | "ORGANIZATION" | "SYSTEM";
        id: string;
        name?: string | undefined;
    }[] | undefined;
}>;
type AuthorityContext = z.infer<typeof AuthorityContextSchema>;

declare const DecisionStatusSchema: z.ZodEnum<["ALLOW", "ASK", "BLOCK", "ALLOW_CONSTRAINED", "BOUND_APPROVAL"]>;
type DecisionStatus = z.infer<typeof DecisionStatusSchema>;
declare const DecisionSchema: z.ZodObject<{
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
    decision: "BLOCK" | "ALLOW" | "ASK" | "BOUND_APPROVAL" | "ALLOW_CONSTRAINED";
    riskScore: number;
    deviationScore: number;
    reasons: string[];
    matchedPolicies?: string[] | undefined;
    constraints?: Record<string, any> | undefined;
    approvalRequirements?: Record<string, any> | undefined;
    evidenceMetadata?: Record<string, any> | undefined;
}, {
    decision: "BLOCK" | "ALLOW" | "ASK" | "BOUND_APPROVAL" | "ALLOW_CONSTRAINED";
    riskScore: number;
    deviationScore: number;
    reasons: string[];
    matchedPolicies?: string[] | undefined;
    constraints?: Record<string, any> | undefined;
    approvalRequirements?: Record<string, any> | undefined;
    evidenceMetadata?: Record<string, any> | undefined;
}>;
type Decision = z.infer<typeof DecisionSchema>;

declare const DestinationTypeSchema: z.ZodEnum<["INTERNAL_DATABASE", "INTERNAL_API", "EXTERNAL_API", "EXTERNAL_WEBHOOK", "EMAIL", "PUBLIC_WEB", "FILE_SYSTEM", "PRODUCTION_INFRASTRUCTURE", "MCP_TOOL", "SAAS_TOOL", "UNKNOWN"]>;
type DestinationType = z.infer<typeof DestinationTypeSchema>;
declare const DestinationSchema: z.ZodObject<{
    /** The category of destination */
    type: z.ZodEnum<["INTERNAL_DATABASE", "INTERNAL_API", "EXTERNAL_API", "EXTERNAL_WEBHOOK", "EMAIL", "PUBLIC_WEB", "FILE_SYSTEM", "PRODUCTION_INFRASTRUCTURE", "MCP_TOOL", "SAAS_TOOL", "UNKNOWN"]>;
    /** Identifier (e.g. hostname, DB name, service name) */
    identifier: z.ZodString;
    /** Whether this destination is considered internal or external */
    isExternal: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN";
    identifier: string;
    isExternal: boolean;
}, {
    type: "INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN";
    identifier: string;
    isExternal?: boolean | undefined;
}>;
type Destination = z.infer<typeof DestinationSchema>;
declare function isExternalDestination(dest: Destination): boolean;

declare const FlowRuleSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    /** Provenance labels that trigger this rule (ANY match triggers) */
    sourceLabels: z.ZodArray<z.ZodEnum<["TRUSTED", "UNTRUSTED", "PII", "INTERNAL_ONLY", "SECRET", "USER_PROVIDED", "EXTERNAL"]>, "many">;
    /** Destination types this rule applies to (ANY match triggers) */
    destinationTypes: z.ZodArray<z.ZodEnum<["INTERNAL_DATABASE", "INTERNAL_API", "EXTERNAL_API", "EXTERNAL_WEBHOOK", "EMAIL", "PUBLIC_WEB", "FILE_SYSTEM", "PRODUCTION_INFRASTRUCTURE", "MCP_TOOL", "SAAS_TOOL", "UNKNOWN"]>, "many">;
    /** The decision to produce when this rule matches */
    decision: z.ZodEnum<["ALLOW", "ASK", "BLOCK"]>;
    /** Human-readable reason */
    reason: z.ZodString;
    /** Priority: lower number = higher priority (evaluated first) */
    priority: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    sourceLabels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
    destinationTypes: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[];
    decision: "BLOCK" | "ALLOW" | "ASK";
    reason: string;
    priority: number;
    id?: string | undefined;
}, {
    sourceLabels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
    destinationTypes: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[];
    decision: "BLOCK" | "ALLOW" | "ASK";
    reason: string;
    id?: string | undefined;
    priority?: number | undefined;
}>;
type FlowRule = z.infer<typeof FlowRuleSchema>;
declare const NoGoPatternSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    /** Human-readable name */
    name: z.ZodString;
    /** The pattern type */
    type: z.ZodEnum<["SEQUENCE", "AFTER", "PROVENANCE_FLOW"]>;
    /** For SEQUENCE/AFTER: the capability or operation that precedes */
    precedingCapability: z.ZodOptional<z.ZodString>;
    /** For SEQUENCE/AFTER: the capability or operation that follows */
    followingCapability: z.ZodOptional<z.ZodString>;
    /** For PROVENANCE_FLOW: source provenance labels */
    sourceLabels: z.ZodOptional<z.ZodArray<z.ZodEnum<["TRUSTED", "UNTRUSTED", "PII", "INTERNAL_ONLY", "SECRET", "USER_PROVIDED", "EXTERNAL"]>, "many">>;
    /** For PROVENANCE_FLOW: destination types */
    destinationTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["INTERNAL_DATABASE", "INTERNAL_API", "EXTERNAL_API", "EXTERNAL_WEBHOOK", "EMAIL", "PUBLIC_WEB", "FILE_SYSTEM", "PRODUCTION_INFRASTRUCTURE", "MCP_TOOL", "SAAS_TOOL", "UNKNOWN"]>, "many">>;
    /** Whether this should BLOCK or ASK */
    decision: z.ZodDefault<z.ZodEnum<["ALLOW", "ASK", "BLOCK"]>>;
    /** Human-readable reason */
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "SEQUENCE" | "AFTER" | "PROVENANCE_FLOW";
    decision: "BLOCK" | "ALLOW" | "ASK";
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
    decision?: "BLOCK" | "ALLOW" | "ASK" | undefined;
    precedingCapability?: string | undefined;
    followingCapability?: string | undefined;
}>;
type NoGoPattern = z.infer<typeof NoGoPatternSchema>;
declare const PolicySchema: z.ZodObject<{
    /** Unique policy ID */
    id: z.ZodString;
    /** Monotonically increasing version */
    version: z.ZodNumber;
    /** Human-readable name */
    name: z.ZodString;
    /** Description */
    description: z.ZodOptional<z.ZodString>;
    /** Information flow rules */
    flowRules: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        /** Provenance labels that trigger this rule (ANY match triggers) */
        sourceLabels: z.ZodArray<z.ZodEnum<["TRUSTED", "UNTRUSTED", "PII", "INTERNAL_ONLY", "SECRET", "USER_PROVIDED", "EXTERNAL"]>, "many">;
        /** Destination types this rule applies to (ANY match triggers) */
        destinationTypes: z.ZodArray<z.ZodEnum<["INTERNAL_DATABASE", "INTERNAL_API", "EXTERNAL_API", "EXTERNAL_WEBHOOK", "EMAIL", "PUBLIC_WEB", "FILE_SYSTEM", "PRODUCTION_INFRASTRUCTURE", "MCP_TOOL", "SAAS_TOOL", "UNKNOWN"]>, "many">;
        /** The decision to produce when this rule matches */
        decision: z.ZodEnum<["ALLOW", "ASK", "BLOCK"]>;
        /** Human-readable reason */
        reason: z.ZodString;
        /** Priority: lower number = higher priority (evaluated first) */
        priority: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        sourceLabels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        destinationTypes: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[];
        decision: "BLOCK" | "ALLOW" | "ASK";
        reason: string;
        priority: number;
        id?: string | undefined;
    }, {
        sourceLabels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        destinationTypes: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[];
        decision: "BLOCK" | "ALLOW" | "ASK";
        reason: string;
        id?: string | undefined;
        priority?: number | undefined;
    }>, "many">>;
    /** No-go trajectory patterns */
    noGoPatterns: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        /** Human-readable name */
        name: z.ZodString;
        /** The pattern type */
        type: z.ZodEnum<["SEQUENCE", "AFTER", "PROVENANCE_FLOW"]>;
        /** For SEQUENCE/AFTER: the capability or operation that precedes */
        precedingCapability: z.ZodOptional<z.ZodString>;
        /** For SEQUENCE/AFTER: the capability or operation that follows */
        followingCapability: z.ZodOptional<z.ZodString>;
        /** For PROVENANCE_FLOW: source provenance labels */
        sourceLabels: z.ZodOptional<z.ZodArray<z.ZodEnum<["TRUSTED", "UNTRUSTED", "PII", "INTERNAL_ONLY", "SECRET", "USER_PROVIDED", "EXTERNAL"]>, "many">>;
        /** For PROVENANCE_FLOW: destination types */
        destinationTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["INTERNAL_DATABASE", "INTERNAL_API", "EXTERNAL_API", "EXTERNAL_WEBHOOK", "EMAIL", "PUBLIC_WEB", "FILE_SYSTEM", "PRODUCTION_INFRASTRUCTURE", "MCP_TOOL", "SAAS_TOOL", "UNKNOWN"]>, "many">>;
        /** Whether this should BLOCK or ASK */
        decision: z.ZodDefault<z.ZodEnum<["ALLOW", "ASK", "BLOCK"]>>;
        /** Human-readable reason */
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "SEQUENCE" | "AFTER" | "PROVENANCE_FLOW";
        decision: "BLOCK" | "ALLOW" | "ASK";
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
        decision?: "BLOCK" | "ALLOW" | "ASK" | undefined;
        precedingCapability?: string | undefined;
        followingCapability?: string | undefined;
    }>, "many">>;
    /** Forbidden capabilities (hard deny) */
    forbiddenCapabilities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Capabilities that always require BOUND_APPROVAL */
    boundApprovalCapabilities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Whether this policy is active */
    active: z.ZodDefault<z.ZodBoolean>;
    /** When this policy was created */
    createdAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    forbiddenCapabilities: string[];
    flowRules: {
        sourceLabels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        destinationTypes: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[];
        decision: "BLOCK" | "ALLOW" | "ASK";
        reason: string;
        priority: number;
        id?: string | undefined;
    }[];
    name: string;
    noGoPatterns: {
        type: "SEQUENCE" | "AFTER" | "PROVENANCE_FLOW";
        decision: "BLOCK" | "ALLOW" | "ASK";
        reason: string;
        name: string;
        id?: string | undefined;
        sourceLabels?: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[] | undefined;
        destinationTypes?: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[] | undefined;
        precedingCapability?: string | undefined;
        followingCapability?: string | undefined;
    }[];
    version: number;
    boundApprovalCapabilities: string[];
    active: boolean;
    description?: string | undefined;
    createdAt?: string | undefined;
}, {
    id: string;
    name: string;
    version: number;
    forbiddenCapabilities?: string[] | undefined;
    flowRules?: {
        sourceLabels: ("TRUSTED" | "UNTRUSTED" | "PII" | "INTERNAL_ONLY" | "SECRET" | "USER_PROVIDED" | "EXTERNAL")[];
        destinationTypes: ("INTERNAL_DATABASE" | "INTERNAL_API" | "EXTERNAL_API" | "EXTERNAL_WEBHOOK" | "EMAIL" | "PUBLIC_WEB" | "FILE_SYSTEM" | "PRODUCTION_INFRASTRUCTURE" | "MCP_TOOL" | "SAAS_TOOL" | "UNKNOWN")[];
        decision: "BLOCK" | "ALLOW" | "ASK";
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
        decision?: "BLOCK" | "ALLOW" | "ASK" | undefined;
        precedingCapability?: string | undefined;
        followingCapability?: string | undefined;
    }[] | undefined;
    description?: string | undefined;
    boundApprovalCapabilities?: string[] | undefined;
    active?: boolean | undefined;
    createdAt?: string | undefined;
}>;
type Policy = z.infer<typeof PolicySchema>;
declare function validatePolicy(policy: unknown): {
    valid: boolean;
    errors: string[];
};

declare const ApprovalBindingSchema: z.ZodObject<{
    /** Unique approval ID */
    id: z.ZodString;
    /** The execution this approval is bound to */
    executionId: z.ZodString;
    /** The action event this approval is bound to */
    actionEventId: z.ZodString;
    /** System requested */
    system: z.ZodString;
    /** Operation requested */
    operation: z.ZodString;
    /** Bound capability */
    capability: z.ZodString;
    /** Bound resource */
    resource: z.ZodString;
    /** SHA-256 hash of the canonicalized action arguments */
    argumentsHash: z.ZodString;
    /** Hash or representation of the provenance state */
    provenanceHash: z.ZodString;
    /** Hash or string representation of the destination */
    destinationHash: z.ZodString;
    /** Exact policy snapshot this was evaluated against */
    policySnapshotId: z.ZodString;
    /** When the approval expires (ISO datetime) */
    expiresAt: z.ZodString;
    /** Whether this approval has been consumed */
    consumed: z.ZodDefault<z.ZodBoolean>;
    /** When the approval was consumed */
    consumedAt: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "EXPIRED", "INVALIDATED"]>;
    /** Who approved it */
    approvedBy: z.ZodOptional<z.ZodString>;
    /** When it was created */
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "INVALIDATED";
    id: string;
    executionId: string;
    system: string;
    operation: string;
    resource: string;
    capability: string;
    createdAt: string;
    actionEventId: string;
    argumentsHash: string;
    provenanceHash: string;
    destinationHash: string;
    policySnapshotId: string;
    expiresAt: string;
    consumed: boolean;
    consumedAt?: string | undefined;
    approvedBy?: string | undefined;
}, {
    status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "INVALIDATED";
    id: string;
    executionId: string;
    system: string;
    operation: string;
    resource: string;
    capability: string;
    createdAt: string;
    actionEventId: string;
    argumentsHash: string;
    provenanceHash: string;
    destinationHash: string;
    policySnapshotId: string;
    expiresAt: string;
    consumed?: boolean | undefined;
    consumedAt?: string | undefined;
    approvedBy?: string | undefined;
}>;
type ApprovalBinding = z.infer<typeof ApprovalBindingSchema>;
/** Canonicalize action arguments for hashing. Deterministic JSON. */
declare function canonicalizeArguments(args: Record<string, unknown>): string;
/** Compute SHA-256 hash of a string (works in Node.js) */
declare function hashArguments(canonical: string): Promise<string>;
/** Validate that an approval binding matches the current action */
declare function validateApprovalBinding(binding: ApprovalBinding, executionId: string, system: string, operation: string, capability: string, resource: string, argumentsHash: string, provenanceHash: string, destinationHash: string, policySnapshotId: string): {
    valid: boolean;
    reason?: string;
};

declare class HeedError extends Error {
    decision: string;
    reasons: string[];
    constructor(message: string, decision?: string, reasons?: string[]);
}
declare class ProvenanceManager {
    /** Mark a specific value (or the execution context) with provenance labels */
    mark(labels: ProvenanceLabel[], source?: string): void;
    /** Retrieve the active provenance context */
    getContext(): ProvenanceContext;
    /** Reset provenance (useful for testing or boundary resets) */
    reset(): void;
    /** Apply an authorized security transformation to the current data context */
    applyTrustedTransformation(transformationId: string, outputLabels: ProvenanceLabel[], reason: string): void;
}
declare class Heed {
    private config;
    provenance: ProvenanceManager;
    constructor(config: {
        agentId: string;
        runtimeUrl: string;
        executionId?: string;
        apiKey?: string;
    });
    /** Set the execution ID for this SDK instance */
    setExecutionId(id: string): void;
    /** Creates a new execution in the HEED runtime */
    createExecution(objective: string, contract: ExecutionContract, authority?: AuthorityContext): Promise<string>;
    /** Execute an action against the runtime firewall */
    execute<T = any>(action: Omit<RawActionRequest, "provenanceLabels">): Promise<T>;
    /** Wrap an existing tool/function with HEED runtime evaluation */
    wrapTool<TArgs extends any[], TReturn>(toolFn: (...args: TArgs) => Promise<TReturn>, metadata: {
        system: string;
        operation: string;
        resource: string;
        capability?: string;
        destination?: {
            type: string;
            identifier: string;
        };
    }): (...args: TArgs) => Promise<TReturn>;
    private getHeaders;
}

export { type Action, ActionSchema, type ApprovalBinding, ApprovalBindingSchema, type AuthorityContext, AuthorityContextSchema, type AuthorityType, AuthorityTypeSchema, type Decision, DecisionSchema, type DecisionStatus, DecisionStatusSchema, type Destination, DestinationSchema, type DestinationType, DestinationTypeSchema, type ExecutionContract, ExecutionContractSchema, type FlowRule, FlowRuleSchema, Heed, HeedError, type NoGoPattern, NoGoPatternSchema, type Policy, PolicySchema, type Provenance, type ProvenanceContext, ProvenanceContextSchema, type ProvenanceLabel, ProvenanceLabelSchema, ProvenanceManager, ProvenanceSchema, type RawActionRequest, RawActionRequestSchema, type Sensitivity, SensitivitySchema, canonicalizeArguments, createProvenance, emptyProvenance, hasAnyLabel, hashArguments, isExternalDestination, mergeProvenance, propagateProvenance, validateApprovalBinding, validatePolicy };
