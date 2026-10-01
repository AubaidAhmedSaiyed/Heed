"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionSchema = exports.DecisionStatusSchema = void 0;
const zod_1 = require("zod");
exports.DecisionStatusSchema = zod_1.z.enum([
    "ALLOW",
    "ASK",
    "BLOCK",
    // Phase 4 additions:
    "ALLOW_CONSTRAINED",
    "BOUND_APPROVAL"
]);
exports.DecisionSchema = zod_1.z.object({
    decision: exports.DecisionStatusSchema,
    riskScore: zod_1.z.number().min(0).max(100),
    deviationScore: zod_1.z.number().min(0).max(100),
    reasons: zod_1.z.array(zod_1.z.string()),
    // ─── Phase 4 additions ─────────────────────────────────────
    /** IDs or names of policies that matched and contributed to this decision */
    matchedPolicies: zod_1.z.array(zod_1.z.string()).optional(),
    /** For ALLOW_CONSTRAINED: specific runtime constraints to apply (e.g. timeout, rate limit) */
    constraints: zod_1.z.record(zod_1.z.any()).optional(),
    /** For BOUND_APPROVAL: requirements for the approval (e.g. required authority) */
    approvalRequirements: zod_1.z.record(zod_1.z.any()).optional(),
    /** Evidence metadata for auditing (e.g. hashes, timestamps) */
    evidenceMetadata: zod_1.z.record(zod_1.z.any()).optional(),
});
