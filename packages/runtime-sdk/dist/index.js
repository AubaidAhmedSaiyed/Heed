"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ActionSchema: () => ActionSchema,
  ApprovalBindingSchema: () => ApprovalBindingSchema,
  AuthorityContextSchema: () => AuthorityContextSchema,
  AuthorityTypeSchema: () => AuthorityTypeSchema,
  DecisionSchema: () => DecisionSchema,
  DecisionStatusSchema: () => DecisionStatusSchema,
  DestinationSchema: () => DestinationSchema,
  DestinationTypeSchema: () => DestinationTypeSchema,
  ExecutionContractSchema: () => ExecutionContractSchema,
  FlowRuleSchema: () => FlowRuleSchema,
  Heed: () => Heed,
  HeedError: () => HeedError,
  NoGoPatternSchema: () => NoGoPatternSchema,
  PolicySchema: () => PolicySchema,
  ProvenanceContextSchema: () => ProvenanceContextSchema,
  ProvenanceLabelSchema: () => ProvenanceLabelSchema,
  ProvenanceManager: () => ProvenanceManager,
  ProvenanceSchema: () => ProvenanceSchema,
  RawActionRequestSchema: () => RawActionRequestSchema,
  SensitivitySchema: () => SensitivitySchema,
  canonicalizeArguments: () => canonicalizeArguments,
  createProvenance: () => createProvenance,
  emptyProvenance: () => emptyProvenance,
  hasAnyLabel: () => hasAnyLabel,
  hashArguments: () => hashArguments,
  isExternalDestination: () => isExternalDestination,
  mergeProvenance: () => mergeProvenance,
  propagateProvenance: () => propagateProvenance,
  validateApprovalBinding: () => validateApprovalBinding,
  validatePolicy: () => validatePolicy
});
module.exports = __toCommonJS(index_exports);

// src/models/Provenance.ts
var import_zod = require("zod");
var ProvenanceLabelSchema = import_zod.z.enum([
  "TRUSTED",
  "UNTRUSTED",
  "PII",
  "INTERNAL_ONLY",
  "SECRET",
  "USER_PROVIDED",
  "EXTERNAL"
]);
var ProvenanceSchema = import_zod.z.object({
  /** One or more provenance labels. A single datum can carry multiple. */
  labels: import_zod.z.array(ProvenanceLabelSchema).min(1),
  /** Human-readable source identifier (e.g. "customer_database", "user_input") */
  source: import_zod.z.string().optional(),
  /** UUID of the action event that produced this data, if any */
  sourceActionId: import_zod.z.string().uuid().optional(),
  /** When the provenance was assigned */
  timestamp: import_zod.z.string().datetime().optional()
});
var ProvenanceContextSchema = import_zod.z.object({
  /** All provenance labels currently active in this execution */
  activeLabels: import_zod.z.array(ProvenanceLabelSchema),
  /** Individual provenance entries that contributed */
  entries: import_zod.z.array(ProvenanceSchema)
});
function mergeProvenance(a, b) {
  const mergedLabels = Array.from(/* @__PURE__ */ new Set([...a.activeLabels, ...b.activeLabels]));
  const mergedEntries = [...a.entries, ...b.entries];
  return { activeLabels: mergedLabels, entries: mergedEntries };
}
function createProvenance(labels, source) {
  const entry = {
    labels,
    source,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  return { activeLabels: [...labels], entries: [entry] };
}
function propagateProvenance(existing, newLabels, source, sourceActionId) {
  const entry = {
    labels: newLabels,
    source,
    sourceActionId,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  return {
    activeLabels: Array.from(/* @__PURE__ */ new Set([...existing.activeLabels, ...newLabels])),
    entries: [...existing.entries, entry]
  };
}
function hasAnyLabel(ctx, labels) {
  return labels.some((l) => ctx.activeLabels.includes(l));
}
function emptyProvenance() {
  return { activeLabels: [], entries: [] };
}

// src/models/ExecutionContract.ts
var import_zod4 = require("zod");

// src/models/Policy.ts
var import_zod3 = require("zod");

// src/models/Destination.ts
var import_zod2 = require("zod");
var DestinationTypeSchema = import_zod2.z.enum([
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
  "UNKNOWN"
]);
var DestinationSchema = import_zod2.z.object({
  /** The category of destination */
  type: DestinationTypeSchema,
  /** Identifier (e.g. hostname, DB name, service name) */
  identifier: import_zod2.z.string(),
  /** Whether this destination is considered internal or external */
  isExternal: import_zod2.z.boolean().default(false)
});
var EXTERNAL_TYPES = /* @__PURE__ */ new Set([
  "EXTERNAL_API",
  "EXTERNAL_WEBHOOK",
  "EMAIL",
  "PUBLIC_WEB",
  "SAAS_TOOL"
]);
function isExternalDestination(dest) {
  return dest.isExternal || EXTERNAL_TYPES.has(dest.type);
}

// src/models/Policy.ts
var FlowDecisionSchema = import_zod3.z.enum(["ALLOW", "ASK", "BLOCK"]);
var FlowRuleSchema = import_zod3.z.object({
  id: import_zod3.z.string().optional(),
  /** Provenance labels that trigger this rule (ANY match triggers) */
  sourceLabels: import_zod3.z.array(ProvenanceLabelSchema).min(1),
  /** Destination types this rule applies to (ANY match triggers) */
  destinationTypes: import_zod3.z.array(DestinationTypeSchema).min(1),
  /** The decision to produce when this rule matches */
  decision: FlowDecisionSchema,
  /** Human-readable reason */
  reason: import_zod3.z.string(),
  /** Priority: lower number = higher priority (evaluated first) */
  priority: import_zod3.z.number().int().default(100)
});
var NoGoPatternSchema = import_zod3.z.object({
  id: import_zod3.z.string().optional(),
  /** Human-readable name */
  name: import_zod3.z.string(),
  /** The pattern type */
  type: import_zod3.z.enum([
    "SEQUENCE",
    // A followed by B
    "AFTER",
    // A cannot occur after B  
    "PROVENANCE_FLOW"
    // provenance X → destination Y
  ]),
  /** For SEQUENCE/AFTER: the capability or operation that precedes */
  precedingCapability: import_zod3.z.string().optional(),
  /** For SEQUENCE/AFTER: the capability or operation that follows */
  followingCapability: import_zod3.z.string().optional(),
  /** For PROVENANCE_FLOW: source provenance labels */
  sourceLabels: import_zod3.z.array(ProvenanceLabelSchema).optional(),
  /** For PROVENANCE_FLOW: destination types */
  destinationTypes: import_zod3.z.array(DestinationTypeSchema).optional(),
  /** Whether this should BLOCK or ASK */
  decision: FlowDecisionSchema.default("BLOCK"),
  /** Human-readable reason */
  reason: import_zod3.z.string()
});
var PolicySchema = import_zod3.z.object({
  /** Unique policy ID */
  id: import_zod3.z.string(),
  /** Monotonically increasing version */
  version: import_zod3.z.number().int().positive(),
  /** Human-readable name */
  name: import_zod3.z.string(),
  /** Description */
  description: import_zod3.z.string().optional(),
  /** Information flow rules */
  flowRules: import_zod3.z.array(FlowRuleSchema).default([]),
  /** No-go trajectory patterns */
  noGoPatterns: import_zod3.z.array(NoGoPatternSchema).default([]),
  /** Forbidden capabilities (hard deny) */
  forbiddenCapabilities: import_zod3.z.array(import_zod3.z.string()).default([]),
  /** Capabilities that always require BOUND_APPROVAL */
  boundApprovalCapabilities: import_zod3.z.array(import_zod3.z.string()).default([]),
  /** Whether this policy is active */
  active: import_zod3.z.boolean().default(true),
  /** When this policy was created */
  createdAt: import_zod3.z.string().datetime().optional()
});
function validatePolicy(policy) {
  const result = PolicySchema.safeParse(policy);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`)
  };
}

// src/models/ExecutionContract.ts
var ExecutionContractSchema = import_zod4.z.object({
  id: import_zod4.z.string().uuid().optional(),
  executionId: import_zod4.z.string().uuid().optional(),
  objective: import_zod4.z.string(),
  expectedActions: import_zod4.z.array(import_zod4.z.string()).default([]),
  allowedSystems: import_zod4.z.array(import_zod4.z.string()).default([]),
  allowedCapabilities: import_zod4.z.array(import_zod4.z.string()).default([]),
  restrictedResources: import_zod4.z.array(import_zod4.z.string()).default([]),
  maxActions: import_zod4.z.number().int().positive().optional().nullable(),
  maxExternalWrites: import_zod4.z.number().int().nonnegative().optional().nullable(),
  // ─── Phase 4 additions ─────────────────────────────────────
  /** Capabilities that are strictly forbidden, regardless of other rules */
  forbiddenCapabilities: import_zod4.z.array(import_zod4.z.string()).default([]),
  /** Regex patterns for resources that are strictly forbidden */
  forbiddenResourcePatterns: import_zod4.z.array(import_zod4.z.string()).default([]),
  /** Contract-specific information flow rules */
  flowRules: import_zod4.z.array(FlowRuleSchema).default([]),
  /** Contract-specific no-go patterns */
  noGoPatterns: import_zod4.z.array(NoGoPatternSchema).default([]),
  /** General provenance constraints (e.g. "no PII allowed in this execution") */
  forbiddenProvenance: import_zod4.z.array(import_zod4.z.string()).default([]),
  /** Conditions under which execution should automatically terminate */
  terminationConditions: import_zod4.z.array(import_zod4.z.string()).default([])
});

// src/models/Action.ts
var import_zod5 = require("zod");
var SensitivitySchema = import_zod5.z.enum(["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]);
var ActionSchema = import_zod5.z.object({
  id: import_zod5.z.string().uuid().optional(),
  executionId: import_zod5.z.string().uuid().optional(),
  agentId: import_zod5.z.string().optional(),
  system: import_zod5.z.string(),
  operation: import_zod5.z.string(),
  resource: import_zod5.z.string(),
  resourceType: import_zod5.z.string().optional(),
  capability: import_zod5.z.string().optional(),
  sensitivity: SensitivitySchema.optional(),
  impact: import_zod5.z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  argumentsMetadata: import_zod5.z.record(import_zod5.z.any()).optional(),
  timestamp: import_zod5.z.string().datetime().optional(),
  sequenceNumber: import_zod5.z.number().optional(),
  // ─── Phase 4 additions ─────────────────────────────────────
  /** Optional idempotency key to prevent duplicate action side-effects on retries */
  idempotencyKey: import_zod5.z.string().optional(),
  /** Data provenance attached to this action's payload */
  provenance: ProvenanceSchema.optional(),
  /** Where this action's output will go */
  destination: DestinationSchema.optional()
});
var RawActionRequestSchema = import_zod5.z.object({
  system: import_zod5.z.string(),
  operation: import_zod5.z.string(),
  resource: import_zod5.z.string(),
  capability: import_zod5.z.string().optional(),
  arguments: import_zod5.z.record(import_zod5.z.any()),
  // ─── Phase 4 additions ─────────────────────────────────────
  /** Optional idempotency key to prevent duplicate action side-effects on retries */
  idempotencyKey: import_zod5.z.string().optional(),
  /** Optional provenance labels the agent declares on this action's data */
  provenanceLabels: import_zod5.z.array(import_zod5.z.string()).optional(),
  /** Optional provenance source */
  provenanceSource: import_zod5.z.string().optional(),
  destinationType: import_zod5.z.string().optional(),
  destinationIdentifier: import_zod5.z.string().optional()
});

// src/models/Decision.ts
var import_zod6 = require("zod");
var DecisionStatusSchema = import_zod6.z.enum([
  "ALLOW",
  "ASK",
  "BLOCK",
  // Phase 4 additions:
  "ALLOW_CONSTRAINED",
  "BOUND_APPROVAL"
]);
var DecisionSchema = import_zod6.z.object({
  decision: DecisionStatusSchema,
  riskScore: import_zod6.z.number().min(0).max(100),
  deviationScore: import_zod6.z.number().min(0).max(100),
  reasons: import_zod6.z.array(import_zod6.z.string()),
  // ─── Phase 4 additions ─────────────────────────────────────
  /** IDs or names of policies that matched and contributed to this decision */
  matchedPolicies: import_zod6.z.array(import_zod6.z.string()).optional(),
  /** For ALLOW_CONSTRAINED: specific runtime constraints to apply (e.g. timeout, rate limit) */
  constraints: import_zod6.z.record(import_zod6.z.any()).optional(),
  /** For BOUND_APPROVAL: requirements for the approval (e.g. required authority) */
  approvalRequirements: import_zod6.z.record(import_zod6.z.any()).optional(),
  /** Evidence metadata for auditing (e.g. hashes, timestamps) */
  evidenceMetadata: import_zod6.z.record(import_zod6.z.any()).optional()
});

// src/models/Authority.ts
var import_zod7 = require("zod");
var AuthorityTypeSchema = import_zod7.z.enum([
  "USER",
  "SERVICE",
  "ORGANIZATION",
  "SYSTEM"
]);
var AuthorityContextSchema = import_zod7.z.object({
  /** Who is ultimately responsible for this execution */
  type: AuthorityTypeSchema,
  /** Unique identifier for the authority (user ID, service account, etc.) */
  id: import_zod7.z.string(),
  /** Optional display name */
  name: import_zod7.z.string().optional(),
  /** Optional delegation chain: who delegated to whom */
  delegationChain: import_zod7.z.array(import_zod7.z.object({
    type: AuthorityTypeSchema,
    id: import_zod7.z.string(),
    name: import_zod7.z.string().optional()
  })).optional()
});

// src/models/ApprovalBinding.ts
var import_zod8 = require("zod");
var ApprovalBindingSchema = import_zod8.z.object({
  /** Unique approval ID */
  id: import_zod8.z.string().uuid(),
  /** The execution this approval is bound to */
  executionId: import_zod8.z.string(),
  /** The action event this approval is bound to */
  actionEventId: import_zod8.z.string(),
  /** System requested */
  system: import_zod8.z.string(),
  /** Operation requested */
  operation: import_zod8.z.string(),
  /** Bound capability */
  capability: import_zod8.z.string(),
  /** Bound resource */
  resource: import_zod8.z.string(),
  /** SHA-256 hash of the canonicalized action arguments */
  argumentsHash: import_zod8.z.string(),
  /** Hash or representation of the provenance state */
  provenanceHash: import_zod8.z.string(),
  /** Hash or string representation of the destination */
  destinationHash: import_zod8.z.string(),
  /** Exact policy snapshot this was evaluated against */
  policySnapshotId: import_zod8.z.string(),
  /** When the approval expires (ISO datetime) */
  expiresAt: import_zod8.z.string().datetime(),
  /** Whether this approval has been consumed */
  consumed: import_zod8.z.boolean().default(false),
  /** When the approval was consumed */
  consumedAt: import_zod8.z.string().datetime().optional(),
  status: import_zod8.z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED", "INVALIDATED"]),
  /** Who approved it */
  approvedBy: import_zod8.z.string().optional(),
  /** When it was created */
  createdAt: import_zod8.z.string().datetime()
});
function canonicalizeArguments(args) {
  const sorted = Object.keys(args).sort().reduce((acc, key) => {
    acc[key] = args[key];
    return acc;
  }, {});
  return JSON.stringify(sorted);
}
async function hashArguments(canonical) {
  const { createHash } = await import("crypto");
  return createHash("sha256").update(canonical).digest("hex");
}
function validateApprovalBinding(binding, executionId, system, operation, capability, resource, argumentsHash, provenanceHash, destinationHash, policySnapshotId) {
  if (binding.consumed) {
    return { valid: false, reason: "Approval has already been consumed (single-use)" };
  }
  if (binding.status !== "APPROVED") {
    return { valid: false, reason: `Approval status is ${binding.status}` };
  }
  if (new Date(binding.expiresAt) < /* @__PURE__ */ new Date()) {
    return { valid: false, reason: "Approval has expired" };
  }
  if (binding.executionId !== executionId) {
    return { valid: false, reason: "Approval is bound to a different execution" };
  }
  if (binding.system !== system || binding.operation !== operation) {
    return { valid: false, reason: "Approval is bound to a different system/operation" };
  }
  if (binding.capability !== capability) {
    return { valid: false, reason: `Approval is bound to capability '${binding.capability}', not '${capability}'` };
  }
  if (binding.resource !== resource) {
    return { valid: false, reason: `Approval is bound to resource '${binding.resource}', not '${resource}'` };
  }
  if (binding.argumentsHash !== argumentsHash) {
    return { valid: false, reason: "Action arguments have been modified since approval was granted" };
  }
  if (binding.provenanceHash !== provenanceHash) {
    return { valid: false, reason: "Provenance context has mutated since approval" };
  }
  if (binding.destinationHash !== destinationHash) {
    return { valid: false, reason: "Destination has mutated since approval" };
  }
  if (binding.policySnapshotId !== policySnapshotId) {
    return { valid: false, reason: "Policy snapshot has changed since approval" };
  }
  return { valid: true };
}

// src/index.ts
var HeedError = class extends Error {
  decision;
  reasons;
  constructor(message, decision = "BLOCK", reasons = []) {
    super(
      `${message}

Decision: ${decision}
Reasons:
${reasons.map((r) => `  - ${r}`).join("\n")}`
    );
    this.name = "HeedError";
    this.decision = decision;
    this.reasons = reasons;
  }
};
var currentExecutionProvenance = emptyProvenance();
var ProvenanceManager = class {
  /** Mark a specific value (or the execution context) with provenance labels */
  mark(labels, source) {
    currentExecutionProvenance = mergeProvenance(
      currentExecutionProvenance,
      createProvenance(labels, source)
    );
  }
  /** Retrieve the active provenance context */
  getContext() {
    return currentExecutionProvenance;
  }
  /** Reset provenance (useful for testing or boundary resets) */
  reset() {
    currentExecutionProvenance = emptyProvenance();
  }
  /** Apply an authorized security transformation to the current data context */
  applyTrustedTransformation(transformationId, outputLabels, reason) {
    currentExecutionProvenance = {
      entries: [
        ...currentExecutionProvenance.entries,
        { labels: outputLabels, source: `transformation:${transformationId}`, timestamp: (/* @__PURE__ */ new Date()).toISOString() }
      ],
      activeLabels: outputLabels
    };
    console.log(`[Provenance] Applied trusted transformation '${transformationId}'. Reason: ${reason}. New labels: ${outputLabels.join(",")}`);
  }
};
var Heed = class {
  config;
  provenance = new ProvenanceManager();
  constructor(config = {}) {
    const envUrl = typeof process !== "undefined" && process?.env?.HEED_RUNTIME_URL ? process.env.HEED_RUNTIME_URL : void 0;
    const envKey = typeof process !== "undefined" && process?.env?.HEED_API_KEY ? process.env.HEED_API_KEY : void 0;
    this.config = {
      agentId: config.agentId || "default-agent",
      runtimeUrl: (config.runtimeUrl || envUrl || "http://localhost:4000").replace(/\/$/, ""),
      executionId: config.executionId,
      apiKey: config.apiKey || envKey
    };
  }
  /** Set the execution ID for this SDK instance */
  setExecutionId(id) {
    this.config.executionId = id;
  }
  /** Creates a new execution in the HEED runtime */
  async createExecution(objective, contract, authority) {
    const url = `${this.config.runtimeUrl}/api/executions`;
    const headers = this.getHeaders();
    const parsedContract = contract ? ExecutionContractSchema.parse(contract) : { objective };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ objective, contract: parsedContract, authority })
    }).catch((e) => {
      throw new Error(`Unable to reach HEED at ${this.config.runtimeUrl}.
Check HEED_URL and network connectivity.
Details: ${e.message}`);
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error(!this.config.apiKey ? `HEED_API_KEY is required.` : errBody?.error?.message || errBody?.error || `HEED authentication failed. Check your API key.`);
      }
      if (response.status === 404) {
        throw new Error(`The configured HEED agent could not be found.`);
      }
      throw new Error(`Failed to create execution: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    this.config.executionId = result.id;
    return result.id;
  }
  /** Execute an action against the runtime firewall */
  async execute(action) {
    if (!this.config.executionId) {
      await this.createExecution("Direct SDK Execution", {
        objective: "Direct SDK Execution"
      });
    }
    const url = `${this.config.runtimeUrl}/api/executions/${this.config.executionId}/actions`;
    const headers = this.getHeaders();
    const context = this.provenance.getContext();
    const requestPayload = {
      ...action,
      provenanceLabels: context.activeLabels,
      provenanceSource: context.entries.map((e) => e.source).filter(Boolean).join(",") || void 0
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestPayload)
    }).catch((e) => {
      throw new Error(`Unable to reach HEED at ${this.config.runtimeUrl}.
Check HEED_URL and network connectivity.
Details: ${e.message}`);
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const decision = errBody.decision || (response.status === 401 ? "UNAUTHORIZED" : "BLOCK");
      const reasons = errBody.reasons || [];
      const errorMsg = typeof errBody.error === "object" && errBody.error?.message ? errBody.error.message : typeof errBody.error === "string" ? errBody.error : errBody.message || `Action rejected by HEED (${response.status})`;
      if (decision === "ASK" || decision === "BOUND_APPROVAL") {
        throw new HeedError(
          `Action requires human approval.

Execution: ${this.config.executionId}
Action: ${action.operation}
Status: AWAITING_APPROVAL`,
          decision,
          reasons
        );
      }
      throw new HeedError(errorMsg, decision, reasons);
    }
    const result = await response.json();
    return result.data;
  }
  /** Wrap an existing tool/function with HEED runtime evaluation */
  wrapTool(toolFn, metadata) {
    return async (...args) => {
      const actionReq = {
        system: metadata.system,
        operation: metadata.operation,
        resource: metadata.resource,
        capability: metadata.capability,
        destinationType: metadata.destination?.type,
        destinationIdentifier: metadata.destination?.identifier,
        arguments: args.length > 1 ? { args } : args[0] || {}
      };
      await this.execute(actionReq);
      return await toolFn(...args);
    };
  }
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
      "X-Agent-Id": this.config.agentId
    };
    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }
    return headers;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ActionSchema,
  ApprovalBindingSchema,
  AuthorityContextSchema,
  AuthorityTypeSchema,
  DecisionSchema,
  DecisionStatusSchema,
  DestinationSchema,
  DestinationTypeSchema,
  ExecutionContractSchema,
  FlowRuleSchema,
  Heed,
  HeedError,
  NoGoPatternSchema,
  PolicySchema,
  ProvenanceContextSchema,
  ProvenanceLabelSchema,
  ProvenanceManager,
  ProvenanceSchema,
  RawActionRequestSchema,
  SensitivitySchema,
  canonicalizeArguments,
  createProvenance,
  emptyProvenance,
  hasAnyLabel,
  hashArguments,
  isExternalDestination,
  mergeProvenance,
  propagateProvenance,
  validateApprovalBinding,
  validatePolicy
});
