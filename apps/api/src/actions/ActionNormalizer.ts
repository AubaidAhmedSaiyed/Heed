import { RawActionRequest, Action, Sensitivity } from "@heed/runtime";

export class ActionNormalizer {
  async normalize(executionId: string, raw: RawActionRequest): Promise<Action> {
    const redactedArgs = this.redact(raw.arguments);
    const sensitivity = this.classifySensitivity(raw);
    const impact = this.classifyImpact(raw);

    return {
      executionId,
      system: raw.system,
      operation: raw.operation,
      resource: raw.resource,
      capability: raw.capability,
      sensitivity,
      impact,
      argumentsMetadata: redactedArgs,
      timestamp: new Date().toISOString(),
      
      // Phase 4 Extensions
      provenance: raw.provenanceLabels ? {
        labels: raw.provenanceLabels as any,
        source: raw.provenanceSource
      } : undefined,
      destination: raw.destinationType ? {
        type: raw.destinationType as any,
        identifier: raw.destinationIdentifier || raw.resource,
        isExternal: ["EXTERNAL_API", "EXTERNAL_WEBHOOK", "PUBLIC_WEB", "SAAS_TOOL"].includes(raw.destinationType)
      } : undefined
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
    
    if (combined.includes(".env") || combined.includes("secret") || combined.includes("credential")) return "RESTRICTED";
    if (combined.includes("code") || combined.includes("src") || combined.includes("production")) return "CONFIDENTIAL";
    if (combined.includes("private") || combined.includes("internal")) return "INTERNAL";
    
    return "PUBLIC";
  }

  private classifyImpact(raw: RawActionRequest): "LOW" | "MEDIUM" | "HIGH" {
    const capability = (raw.capability || "").toLowerCase();
    const system = raw.system.toLowerCase();
    const resource = raw.resource.toLowerCase();

    // High impact: Destructive ops, deploying, credential reading, arbitrary net writes
    if (capability.includes("deploy") || capability === "credential.read") return "HIGH";
    if (capability.includes(".write") && system === "http") return "HIGH"; // arbitrary HTTP writes are high risk
    if (raw.operation.includes("delete") || raw.operation.includes("drop")) return "HIGH";

    // Medium impact: General writes (e.g. communication, file modification)
    if (capability.includes(".write")) return "MEDIUM";

    // Low impact: Everything else (mostly reads)
    return "LOW";
  }
}
