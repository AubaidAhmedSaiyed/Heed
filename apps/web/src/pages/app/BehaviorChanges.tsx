import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function BehaviorChanges() {
  const [changes, setChanges] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/behavior-changes")
      .then(res => res.json())
      .then(setChanges)
      .catch(console.error);
  }, []);

  return (
    <div className="flex-1 p-10 overflow-y-auto">
      <div className="mb-10">
        <p className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-[var(--faint)] mb-3">[ BEHAVIOR ]</p>
        <h2 className="text-[clamp(24px,3vw,34px)] font-medium tracking-[-0.03em] leading-tight">Drift detection</h2>
        <p className="text-[14px] text-[var(--muted)] mt-3 max-w-[60ch]">
          Deterministic tracking of capability escalation and objective deviation across all agent executions.
        </p>
      </div>

      <div className="space-y-3">
        {changes.map(change => (
          <div key={change.id} className="border border-[var(--line)] rounded-[14px] bg-[var(--surface)] p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[3px] h-full bg-[var(--block)]" />

            <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-[15px] font-medium">{change.agentName}</h3>
                  <Link
                    to={`/app/executions/${change.executionId}`}
                    className="font-mono text-[10px] tracking-[0.08em] text-[var(--faint)] border border-[var(--line)] px-2 py-0.5 rounded hover:border-[var(--line-strong)] hover:text-[var(--muted)] transition-colors"
                  >
                    exec:{change.executionId.split('-')[0]}
                  </Link>
                </div>

                <div className="space-y-1.5">
                  {change.reasons.map((r: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-[var(--block-lit)] mt-0.5 shrink-0" />
                      <span className="font-mono text-[12px] text-[var(--block-lit)]">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shrink-0">
                <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--faint)] block mb-2">Target capability</span>
                <span className="font-mono text-[11px] text-[var(--block-lit)] border border-[rgba(196,73,78,.3)] bg-[rgba(196,73,78,.08)] px-3 py-1.5 rounded-lg">
                  {change.capability || "unknown"}
                </span>
              </div>
            </div>
          </div>
        ))}

        {changes.length === 0 && (
          <div className="border border-[var(--line)] rounded-[14px] bg-[var(--surface)] p-12 text-center">
            <div className="w-10 h-10 rounded-full border border-[var(--line)] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-4 h-4 text-[var(--faint)]" />
            </div>
            <span className="font-mono text-[11px] text-[var(--faint)]">No capability escalations or objective deviations detected.</span>
          </div>
        )}
      </div>
    </div>
  );
}
