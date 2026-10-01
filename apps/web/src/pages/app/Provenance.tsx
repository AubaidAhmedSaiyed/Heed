import React, { useState, useEffect } from 'react';
import { ArrowRight, Database, Server, GitMerge, FileText, CheckCircle, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api';
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  LoadingState,
  Panel,
  Button,
} from '../../components/ui';

export default function Provenance() {
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlow, setSelectedFlow] = useState<any>(null);

  useEffect(() => {
    api
      .getProvenance()
      .then((d) => {
        setFlows(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-full bg-bg text-fg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <PageHeader
          title="Data Provenance & Information Flow"
          subtitle="Cryptographically tracked data origins, classifications, transformations, and egress boundaries."
          icon={GitMerge}
        />

        {loading ? (
          <LoadingState message="Tracking provenance flows..." className="py-20" />
        ) : flows.length === 0 ? (
          <EmptyState
            icon={GitMerge}
            title="No provenance events observed."
            description="When agents ingest and propagate classified data (e.g. PII, SECRETS), data flow vectors are rendered here."
            className="my-12"
          />
        ) : (
          <div className="space-y-4">
            {flows.map((flow, idx) => {
              const isSelected = selectedFlow === flow;
              const source = flow.source || 'Customer record';
              const labels = flow.labels || ['PII'];
              const transformation = flow.transformation || 'Redacted';
              const destination = flow.destination || 'External webhook';
              const decision = flow.decision || 'BLOCK';

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedFlow(flow)}
                  className={`border rounded-xl p-5 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'border-accent bg-surface-2 shadow-sm'
                      : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2/40'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-mono text-xs">
                    {/* Visual 5-Stage Flow */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {/* 1. Source */}
                      <div className="flex items-center gap-1.5 p-2 rounded bg-surface-2 border border-line">
                        <Database className="w-3.5 h-3.5 text-faint" />
                        <span className="text-fg">{source}</span>
                      </div>

                      <ArrowRight className="w-3 h-3 text-line-strong shrink-0" />

                      {/* 2. Classification */}
                      <div className="flex items-center gap-1.5 p-2 rounded bg-surface-2 border border-line">
                        <span className="text-ask font-semibold">{labels.join(', ')}</span>
                      </div>

                      <ArrowRight className="w-3 h-3 text-line-strong shrink-0" />

                      {/* 3. Transformation */}
                      <div className="flex items-center gap-1.5 p-2 rounded bg-surface-2 border border-line">
                        <span className="text-muted">{transformation}</span>
                      </div>

                      <ArrowRight className="w-3 h-3 text-line-strong shrink-0" />

                      {/* 4. Destination */}
                      <div className="flex items-center gap-1.5 p-2 rounded bg-surface-2 border border-line">
                        <Server className="w-3.5 h-3.5 text-faint" />
                        <span className="text-fg">{destination}</span>
                      </div>
                    </div>

                    {/* 5. Decision */}
                    <div className="shrink-0 flex items-center justify-end">
                      <StatusBadge status={decision} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Inspector Drawer */}
      {selectedFlow && (
        <div className="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-line bg-surface/90 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b border-line pb-3">
            <span className="font-mono text-xs tracking-wider uppercase text-fg font-medium">
              Flow Vector Inspector
            </span>
            <button
              onClick={() => setSelectedFlow(null)}
              className="font-mono text-xs text-muted hover:text-fg px-2 py-0.5 rounded border border-line"
            >
              Close
            </button>
          </div>

          <div className="space-y-5 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase text-faint block mb-1">DATA ORIGIN</span>
              <p className="text-fg font-sans text-sm font-medium">{selectedFlow.source || 'Customer record'}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase text-faint block mb-1">PROVENANCE LABELS</span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedFlow.labels || ['PII']).map((l: string) => (
                  <span key={l} className="px-2 py-0.5 rounded bg-surface-2 border border-line text-ask">
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase text-faint block mb-1">TRANSFORMATIONS</span>
              <div className="p-2.5 rounded bg-surface-2 border border-line text-muted">
                {selectedFlow.transformation || 'None / Direct Read'}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase text-faint block mb-1">TARGET SINK</span>
              <div className="p-2.5 rounded bg-surface-2 border border-line text-fg">
                {selectedFlow.destination || 'External webhook'}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase text-faint block mb-1">SECURITY DECISION</span>
              <StatusBadge status={selectedFlow.decision || 'BLOCK'} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
