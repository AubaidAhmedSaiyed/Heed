import { RawActionRequest, Action, Sensitivity } from "@heed-ai/runtime";

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
      idempotencyKey: raw.idempotencyKey,
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
      if (/password|secret|token|key|auth|credential/i.test(key)) {
        redacted[key] = "[REDACTED]";
      } else if (typeof value === "string" && value.length > 100) {
        redacted[key] = `[TRUNCATED_STRING_LENGTH_${value.length}]`;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        redacted[key] = this.redact(value);
      } else {
        redacted[key] = value;
      }
    }
    return redacted;
  }

  private classifySensitivity(raw: RawActionRequest): Sensitivity {
    if (raw.provenanceLabels?.includes("RESTRICTED") || raw.provenanceLabels?.includes("SECRET")) return "RESTRICTED";
    if (raw.provenanceLabels?.includes("CONFIDENTIAL") || raw.provenanceLabels?.includes("PII")) return "CONFIDENTIAL";
    if (raw.provenanceLabels?.includes("INTERNAL")) return "INTERNAL";
    
    const capability = (raw.capability || "").toLowerCase();
    if (capability.startsWith("credential.") || capability.startsWith("secret.")) return "RESTRICTED";
    if (capability.startsWith("production.")) return "CONFIDENTIAL";
    if (capability.startsWith("internal.")) return "INTERNAL";
    
    return "PUBLIC";
  }

  private classifyImpact(raw: RawActionRequest): "LOW" | "MEDIUM" | "HIGH" {
    const capability = (raw.capability || "").toLowerCase();

    if (capability.endsWith(".delete") || capability.endsWith(".execute") || capability.endsWith(".admin")) return "HIGH";
    if (capability.endsWith(".write") || capability.endsWith(".update")) return "MEDIUM";

    return "LOW";
  }
}
