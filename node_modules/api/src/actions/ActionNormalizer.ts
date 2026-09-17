import { RawActionRequest, Action, Sensitivity } from "@heed/runtime";

export class ActionNormalizer {
  async normalize(executionId: string, raw: RawActionRequest): Promise<Action> {
    const redactedArgs = this.redact(raw.arguments);
    const sensitivity = this.classifySensitivity(raw);

    return {
      executionId,
      system: raw.system,
      operation: raw.operation,
      resource: raw.resource,
      sensitivity,
      argumentsMetadata: redactedArgs,
      timestamp: new Date().toISOString()
    };
  }

  private redact(args: Record<string, any>): Record<string, any> {
    const redacted: Record<string, any> = {};
    for (const [key, value] of Object.entries(args)) {
      if (/password|secret|token|key/i.test(key)) {
        redacted[key] = "[REDACTED]";
      } else if (typeof value === "string" && value.length > 100) {
        redacted[key] = `[TRUNCATED_STRING_LENGTH_${value.length}]`;
      } else {
        redacted[key] = value;
      }
    }
    return redacted;
  }

  private classifySensitivity(raw: RawActionRequest): Sensitivity {
    const combined = `${raw.system} ${raw.resource}`.toLowerCase();
    
    if (combined.includes(".env") || combined.includes("secret")) return "RESTRICTED";
    if (combined.includes("code") || combined.includes("src")) return "CONFIDENTIAL";
    if (raw.system === "github" && !combined.includes("public")) return "INTERNAL";
    
    return "PUBLIC";
  }
}
