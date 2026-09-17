"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionContractSchema = void 0;
const zod_1 = require("zod");
exports.ExecutionContractSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    executionId: zod_1.z.string().uuid().optional(),
    objective: zod_1.z.string(),
    expectedActions: zod_1.z.array(zod_1.z.string()),
    allowedSystems: zod_1.z.array(zod_1.z.string()),
    allowedCapabilities: zod_1.z.array(zod_1.z.string()),
    restrictedResources: zod_1.z.array(zod_1.z.string())
});
