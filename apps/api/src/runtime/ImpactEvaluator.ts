import { Action, Decision } from "@heed-ai/runtime";

export interface OperationMetadata {
  reversibility: "REVERSIBLE" | "IRREVERSIBLE" | "UNKNOWN";
  impactWeight: 1 | 3 | 10 | 25;
  dataSensitivity: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  trustEffect: "NONE" | "UNTRUSTED_INPUT" | "SENSITIVE_DATA" | "EXTERNAL_DESTINATION";
  compensationAvailable: boolean;
}

export interface ImpactEvaluationResult {
  decision: "ALLOW" | "ASK" | "BLOCK";
  impactWeight: number;
  remainingBudget: number;
  reversibility: "REVERSIBLE" | "IRREVERSIBLE" | "UNKNOWN";
  newTrustState: string;
  signals: string[];
}

export class ImpactEvaluator {
  public evaluate(
    action: Action,
    metadata: OperationMetadata,
    currentBudget: number,
    consumedBudget: number,
    currentTrustState: string,
    existingDecision: Decision
  ): ImpactEvaluationResult {
    const signals: string[] = [];
    let decision = existingDecision.decision as "ALLOW" | "ASK" | "BLOCK";
    let newTrustState = currentTrustState;

    // Trust State Transitions
    if (metadata.trustEffect !== "NONE") {
      newTrustState = metadata.trustEffect;
      signals.push(`TRUST_BOUNDARY_CROSSED: ${metadata.trustEffect}`);
    }

    if (metadata.dataSensitivity === "RESTRICTED" || metadata.dataSensitivity === "CONFIDENTIAL") {
      signals.push(`SENSITIVE_DATA: ${metadata.dataSensitivity}`);
    }

    const remainingBudget = currentBudget - consumedBudget;
    
    if (metadata.impactWeight >= 10) {
      signals.push(`HIGH_IMPACT_ACTION: ${metadata.impactWeight}`);
    }
    
    if (metadata.reversibility === "IRREVERSIBLE") {
      signals.push("IRREVERSIBLE_ACTION");
    }

    if (metadata.impactWeight > remainingBudget) {
      signals.push("BUDGET_EXCEEDED");
    } else if (remainingBudget - metadata.impactWeight < 5) {
      signals.push("LOW_REMAINING_BUDGET");
    }

    // CASE G & H: Existing policy overrides if it's stricter
    if (decision === "BLOCK" || decision === "ASK") {
      return {
        decision,
        impactWeight: metadata.impactWeight,
        remainingBudget,
        reversibility: metadata.reversibility,
        newTrustState,
        signals
      };
    }

    // CASE E: Critical + Sensitive + External
    if (metadata.impactWeight >= 25 && metadata.dataSensitivity === "RESTRICTED" && metadata.trustEffect === "EXTERNAL_DESTINATION") {
      decision = "BLOCK";
    }
    // CASE F: Unknown Reversibility + High Impact
    else if (metadata.reversibility === "UNKNOWN" && metadata.impactWeight >= 10) {
      decision = "ASK";
    }
    // CASE D: Irreversible + Insufficient Budget
    else if (metadata.reversibility === "IRREVERSIBLE" && metadata.impactWeight > remainingBudget) {
      decision = "ASK";
    }
    // CASE C: Irreversible + Sufficient Budget
    else if (metadata.reversibility === "IRREVERSIBLE" && metadata.impactWeight <= remainingBudget) {
      decision = "ALLOW"; // assuming existing policy allows, which it does based on early return
    }
    // CASE B: Reversible + High Impact + Budget Available
    else if (metadata.reversibility === "REVERSIBLE" && metadata.impactWeight >= 10 && metadata.impactWeight <= remainingBudget) {
      decision = "ASK"; // Configurable threshold. We ASK for >= 10.
    }
    // CASE A: Reversible + Low Impact + Budget Available
    else if (metadata.reversibility === "REVERSIBLE" && metadata.impactWeight <= remainingBudget) {
      decision = "ALLOW";
    }
    // Fallback: Exceeds budget
    else if (metadata.impactWeight > remainingBudget) {
      decision = "ASK";
    }

    return {
      decision,
      impactWeight: metadata.impactWeight,
      remainingBudget,
      reversibility: metadata.reversibility,
      newTrustState,
      signals
    };
  }
}
