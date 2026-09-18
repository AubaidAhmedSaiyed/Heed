"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawActionRequestSchema = exports.ActionSchema = exports.SensitivitySchema = void 0;
const zod_1 = require("zod");
exports.SensitivitySchema = zod_1.z.enum(["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]);
exports.ActionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    executionId: zod_1.z.string().uuid().optional(),
    agentId: zod_1.z.string().optional(),
    system: zod_1.z.string(),
    operation: zod_1.z.string(),
    resource: zod_1.z.string(),
    resourceType: zod_1.z.string().optional(),
    capability: zod_1.z.string().optional(), // New capability field
    sensitivity: exports.SensitivitySchema.optional(),
    impact: zod_1.z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    argumentsMetadata: zod_1.z.record(zod_1.z.any()).optional(),
    timestamp: zod_1.z.string().datetime().optional(),
    sequenceNumber: zod_1.z.number().optional()
});
// Raw action requested by the agent before normalization/redaction
exports.RawActionRequestSchema = zod_1.z.object({
    system: zod_1.z.string(),
    operation: zod_1.z.string(),
    resource: zod_1.z.string(),
    capability: zod_1.z.string().optional(),
    arguments: zod_1.z.record(zod_1.z.any())
});
