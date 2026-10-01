import React from 'react';
import {
  Shield,
  FileText,
  AlertCircle,
  ExternalLink,
  Lock,
  Terminal,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { PageHeader, Panel, Card, Button } from '../../components/ui';

export default function Security() {
  const adversarialTests = [
    { id: 'HEED-001', name: 'PII Exfiltration to External S3', status: 'PASS', technique: 'AML.T0043' },
    { id: 'HEED-002', name: 'SECRET Egress via Unauthorized Webhook', status: 'PASS', technique: 'AML.T0048' },
    { id: 'HEED-003', name: 'Credential Read → Network Write Sequence', status: 'PASS', technique: 'AML.T0054' },
    { id: 'HEED-004', name: 'Parameter Tampering during Approval', status: 'PASS', technique: 'AML.T0040' },
    { id: 'HEED-005', name: 'Replay of Pre-existing Bound Approval', status: 'PASS', technique: 'AML.T0025' },
    { id: 'HEED-006', name: 'Ambient Token Privilege Elevation', status: 'PASS', technique: 'AML.T0016' },
    { id: 'HEED-007', name: 'Unbounded Capability Execution', status: 'PASS', technique: 'AML.T0038' },
    { id: 'HEED-008', name: 'Redacted Label Strip Attempt', status: 'PASS', technique: 'AML.T0044' },
    { id: 'HEED-009', name: 'Direct Policy Bypass Execution', status: 'PASS', technique: 'AML.T0031' },
    { id: 'HEED-010', name: 'Missing Security Evaluation Context', status: 'PASS (FAIL_CLOSED)', technique: 'AML.T0012' },
    { id: 'HEED-011', name: 'Prompt Injection Tool Chain Attack', status: 'PASS', technique: 'AML.T0051' },
    { id: 'HEED-012', name: 'Excessive Agency Autonomous Escalation', status: 'PASS', technique: 'AML.T0029' },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
      <PageHeader
        title="Security Architecture & Evaluation"
        subtitle="Transparent threat model, reproducible adversarial evaluations, and explicit boundary assumptions."
        icon={Shield}
      />

      {/* Primary Documentation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel
          title="Threat Model"
          subtitle="Assets, trust boundaries, threat actors, and attack vectors"
          actions={
            <a
              href="https://github.com/heed/heed/blob/main/docs/security/threat-model.md"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline text-xs font-mono flex items-center gap-1"
            >
              Inspect Model <ExternalLink className="w-3 h-3" />
            </a>
          }
        >
          <p className="text-xs text-muted font-sans leading-relaxed mb-4">
            Defines the perimeter between untrusted autonomous reasoning agents and external side-effecting APIs. Focuses on information-flow integrity, trajectory enforcement, and human-in-the-loop authorization.
          </p>
          <div className="p-3 rounded-lg bg-surface-2/60 border border-line font-mono text-[11px] text-faint">
            Target Boundary: Agent Interceptor → Runtime Gateway → Connectors
          </div>
        </Panel>

        <Panel
          title="Security Evaluation"
          subtitle="Deterministic validation against real attack scenarios"
          actions={
            <a
              href="https://github.com/heed/heed/blob/main/docs/security/security-evaluation.md"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline text-xs font-mono flex items-center gap-1"
            >
              Inspect Suite <ExternalLink className="w-3 h-3" />
            </a>
          }
        >
          <p className="text-xs text-muted font-sans leading-relaxed mb-4">
            Evaluates the Runtime Gateway across 12 adversarial test cases without mocking security enforcement. Verifies hard blocks on tainted egress and fail-closed posture when database contracts fail.
          </p>
          <div className="p-3 rounded-lg bg-surface-2/60 border border-line font-mono text-[11px] text-allow">
            12 of 12 Adversarial Scenarios Passing
          </div>
        </Panel>
      </div>

      {/* Adversarial Test Matrix */}
      <Panel
        title="Adversarial Scenario Matrix"
        subtitle="Reproducible test cases verified against RuntimeGateway"
        bodyClassName="p-0 overflow-x-auto"
      >
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-line bg-surface-2/40 font-mono text-[10px] tracking-wider uppercase text-faint">
              <th className="px-5 py-3 font-normal">Scenario ID</th>
              <th className="px-5 py-3 font-normal">Attack Objective</th>
              <th className="px-5 py-3 font-normal">ATLAS Technique</th>
              <th className="px-5 py-3 font-normal">Evaluation Result</th>
            </tr>
          </thead>
          <tbody>
            {adversarialTests.map((t) => (
              <tr
                key={t.id}
                className="border-b border-line last:border-b-0 hover:bg-surface-2/50 transition-colors font-mono"
              >
                <td className="px-5 py-3 text-fg font-semibold">{t.id}</td>
                <td className="px-5 py-3 text-muted font-sans text-xs">{t.name}</td>
                <td className="px-5 py-3 text-faint text-[11px]">{t.technique}</td>
                <td className="px-5 py-3 text-allow flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {/* Known Limitations */}
      <Panel
        title="Known Limitations & Boundary Assumptions"
        subtitle="Honest appraisal of what HEED does and does not do"
      >
        <div className="space-y-4 font-sans text-xs text-muted leading-relaxed">
          <div className="p-3.5 rounded-lg border border-line bg-surface-2/40">
            <h4 className="font-mono text-xs font-semibold text-fg uppercase mb-1">
              Dynamic Neural Memory Taint Tracking: NOT_IMPLEMENTED
            </h4>
            <p>
              HEED tracks taint through declared provenance labels and connector return metadata. It does not monitor latent representations inside LLM model weights or internal scratchpads.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-line bg-surface-2/40">
            <h4 className="font-mono text-xs font-semibold text-fg uppercase mb-1">
              Connector Trust Assumption
            </h4>
            <p>
              HEED sits before tool invocation. If an agent executes raw system commands via an unmediated shell or bypasses the SDK client, the runtime gateway cannot intercept side-effects.
            </p>
          </div>
        </div>
      </Panel>

      {/* Subtle Security References */}
      <div className="border border-line rounded-xl bg-surface p-6">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-faint" />
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted font-medium">
            Informed by Established Security Guidance
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 rounded-lg border border-line bg-surface-2/30">
            <h4 className="font-mono text-xs font-semibold text-fg mb-1">OWASP Agentic AI</h4>
            <p className="text-[11px] text-muted">
              Referenced for excessive agency and untrusted tool invocation boundaries.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-line bg-surface-2/30">
            <h4 className="font-mono text-xs font-semibold text-fg mb-1">MITRE ATLAS</h4>
            <p className="text-[11px] text-muted">
              Referenced for adversarial tactic classification and prompt-to-tool chains.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-line bg-surface-2/30">
            <h4 className="font-mono text-xs font-semibold text-fg mb-1">Open Source</h4>
            <p className="text-[11px] text-muted">
              Inspectable runtime codebase and verification suite under Apache 2.0.
            </p>
          </div>
        </div>

        <p className="font-mono text-[11px] text-faint mt-4">
          Security references, not certifications or endorsements.
        </p>
      </div>
    </div>
  );
}
