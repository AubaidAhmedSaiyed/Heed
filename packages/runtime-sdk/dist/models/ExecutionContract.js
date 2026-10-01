"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionContractSchema = void 0;
const zod_1 = require("zod");
const Policy_1 = require("./Policy");
exports.ExecutionContractSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    executionId: zod_1.z.string().uuid().optional(),
    objective: zod_1.z.string(),
    expectedActions: zod_1.z.array(zod_1.z.string()).default([]),
    allowedSystems: zod_1.z.array(zod_1.z.string()).default([]),
    allowedCapabilities: zod_1.z.array(zod_1.z.string()).default([]),
    restrictedResources: zod_1.z.array(zod_1.z.string()).default([]),
    maxActions: zod_1.z.number().int().positive().optional().nullable(),
    maxExternalWrites: zod_1.z.number().int().nonnegative().optional().nullable(),
    // ─── Phase 4 additions ─────────────────────────────────────
    /** Capabilities that are strictly forbidden, regardless of other rules */
    forbiddenCapabilities: zod_1.z.array(zod_1.z.string()).default([]),
    /** Regex patterns for resources that are strictly forbidden */
    forbiddenResourcePatterns: zod_1.z.array(zod_1.z.string()).default([]),
    /** Contract-specific information flow rules */
    flowRules: zod_1.z.array(Policy_1.FlowRuleSchema).default([]),
    /** Contract-specific no-go patterns */
    noGoPatterns: zod_1.z.array(Policy_1.NoGoPatternSchema).default([]),
    /** General provenance constraints (e.g. "no PII allowed in this execution") */
    forbiddenProvenance: zod_1.z.array(zod_1.z.string()).default([]),
    /** Conditions under which execution should automatically terminate */
    terminationConditions: zod_1.z.array(zod_1.z.string()).default([]),
});
