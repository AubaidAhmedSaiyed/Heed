"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionSchema = exports.DecisionStatusSchema = void 0;
const zod_1 = require("zod");
exports.DecisionStatusSchema = zod_1.z.enum(["ALLOW", "ASK", "BLOCK"]);
exports.DecisionSchema = zod_1.z.object({
    decision: exports.DecisionStatusSchema,
    riskScore: zod_1.z.number().min(0).max(100),
    deviationScore: zod_1.z.number().min(0).max(100),
    reasons: zod_1.z.array(zod_1.z.string())
});
