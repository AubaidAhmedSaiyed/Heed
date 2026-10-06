import { RawActionRequest } from "@heed-ai/runtime";
import { OperationMetadata } from "../../apps/api/src/runtime/ImpactEvaluator";

export interface Connector {
  name: string;
  capabilities: string[];
  
  getOperationMetadata(operation: string, capability?: string): OperationMetadata;
  execute(action: RawActionRequest): Promise<any>;
  compensate?(action: RawActionRequest): Promise<any>;
}
