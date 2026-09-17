import { z } from "zod";

export const ExecutionContractSchema = z.object({
  id: z.string().uuid().optional(),
  executionId: z.string().uuid().optional(),
  objective: z.string(),
  expectedActions: z.array(z.string()),
  allowedSystems: z.array(z.string()),
  allowedCapabilities: z.array(z.string()),
  restrictedResources: z.array(z.string())
});

export type ExecutionContract = z.infer<typeof ExecutionContractSchema>;
