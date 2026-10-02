import { RawActionRequest } from "@heed-ai/runtime";

export interface Connector {
  name: string;
  capabilities: string[];
  
  execute(action: RawActionRequest): Promise<any>;
  
  // Potential future extensions
  // classify(action: RawActionRequest): ActionClassification;
  // sanitize(action: RawActionRequest): SanitizedAction;
}
