import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, ArrowRight, Lock, Clock, Plus, Code, ArrowLeft, GitCommit } from 'lucide-react';
import { api } from '../../lib/api';
import {
  PageHeader,
  StatusBadge,
  LoadingState,
  Button,
  Card,
  Panel,
} from '../../components/ui';

export default function PolicyDetail() {
  const { id } = useParams();
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);

  useEffect(() => {
    api
      .getPolicies()
      .then((d) => {
        const p = d.find((x: any) => x.id === id);
        if (p) {
          setPolicy(p);
          const published =
            p.versions?.find((v: any) => v.status === 'PUBLISHED') || p.versions?.[0] || p;
          setSelectedVersion(published);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <LoadingState message="Fetching immutable policy contracts..." className="h-full" />;
  }

  if (!policy) {
    return (
      <div className="p-8 text-center font-mono text-xs text-block">
        Policy not found in active registry.
      </div>
    );
  }

  const versions = policy.versions || [policy];
  const rules = selectedVersion?.rules || {
    flowRules: [],
    noGoPatterns: [],
    forbiddenCapabilities: [],
    boundApprovalCapabilities: [],
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-bg text-fg overflow-hidden">
      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <Link
          to="/app/policies"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-fg mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to policies
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-line pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-medium tracking-tight text-fg">
                {policy.name}
              </h1>
              <StatusBadge status={selectedVersion?.status || 'PUBLISHED'} />
            </div>
            <p className="text-xs text-muted mt-1.5 font-sans max-w-2xl">
              {selectedVersion?.description || 'Immutable boundary rules enforced for all registered executions.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* IFC Flow Rules */}
          <Panel
            title="Information Flow Rules"
            subtitle="Provenance labels and destination constraints"
          >
            {rules.flowRules?.length > 0 ? (
              <div className="space-y-3 font-mono text-xs">
                {rules.flowRules.map((r: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 border border-block/20 bg-block-muted rounded-lg flex flex-col gap-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted w-10">IF:</span>
                      <span className="text-ask font-semibold">
                        [{(r.sourceLabels || []).join(', ')}]
                      </span>
                      <ArrowRight className="w-3 h-3 text-faint" />
                      <span className="text-fg">
                        [{(r.destinationTypes || []).join(', ')}]
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-muted w-10">THEN:</span>
                      <StatusBadge status={r.decision} size="sm" />
                    </div>

                    {r.reason && (
                      <p className="text-[11px] text-faint pt-2 border-t border-line font-sans">
                        {r.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-faint font-mono italic">
                No IFC rules defined in this version.
              </p>
            )}
          </Panel>

          {/* Trajectory & Behavioral Boundaries */}
          <Panel
            title="Trajectory Constraints"
            subtitle="Forbidden capabilities & sequence No-Go patterns"
          >
            <div className="space-y-3 font-mono text-xs">
              {rules.noGoPatterns?.map((p: any, i: number) => (
                <div
                  key={i}
                  className="p-3.5 border border-line rounded-lg bg-surface-2/60 text-xs"
                >
                  <span className="text-block font-semibold">NO-GO: </span>
                  <span className="text-fg">{p.precedingCapability}</span>
                  <span className="text-muted"> → THEN → </span>
                  <span className="text-fg">{p.followingCapability}</span>
                </div>
              ))}

              {rules.forbiddenCapabilities?.map((c: string, i: number) => (
                <div
                  key={`c-${i}`}
                  className="p-3 border border-block/25 text-block bg-block-muted rounded-lg"
                >
                  <span className="font-bold">FORBIDDEN:</span> {c}
                </div>
              ))}

              {rules.boundApprovalCapabilities?.map((c: string, i: number) => (
                <div
                  key={`b-${i}`}
                  className="p-3 border border-ask/30 text-ask bg-ask-muted rounded-lg"
                >
                  <span className="font-bold">REQUIRES_BOUND_APPROVAL:</span> {c}
                </div>
              ))}

              {!rules.noGoPatterns?.length &&
                !rules.forbiddenCapabilities?.length &&
                !rules.boundApprovalCapabilities?.length && (
                  <p className="text-xs text-faint font-mono italic">
                    No structural constraints configured.
                  </p>
                )}
            </div>
          </Panel>
        </div>

        {/* Raw JSON Structure */}
        <div className="mt-8">
          <Panel title="Raw Policy Contract Definition" subtitle="Cryptographically verified specification">
            <pre className="p-4 bg-surface-2/50 border border-line rounded-lg font-mono text-xs text-muted overflow-x-auto">
              {JSON.stringify(selectedVersion?.rules || selectedVersion, null, 2)}
            </pre>
          </Panel>
        </div>
      </div>

      {/* Version Lineage Sidebar */}
      <div className="w-full md:w-72 shrink-0 border-t md:border-t-0 md:border-l border-line bg-surface/80 p-6 overflow-y-auto">
        <h3 className="font-mono text-xs uppercase tracking-wider text-faint mb-6 flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-accent" />
          Version Lineage
        </h3>

        <div className="space-y-4 relative">
          <div className="absolute left-3 top-3 bottom-3 w-px bg-line-strong" />

          {versions
            .slice()
            .reverse()
            .map((v: any) => {
              const isSelected = selectedVersion?.version === v.version;
              const isPublished = v.status === 'PUBLISHED';

              return (
                <div
                  key={v.version}
                  onClick={() => setSelectedVersion(v)}
                  className={`relative z-10 flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-surface-2 border border-line shadow-sm'
                      : 'hover:bg-surface-2/60'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      isPublished
                        ? 'border-allow bg-bg'
                        : 'border-line-strong bg-surface'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isPublished ? 'bg-allow' : 'bg-muted'
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-fg">
                        v{v.version}
                      </span>
                      <StatusBadge status={v.status || 'ARCHIVED'} size="sm" />
                    </div>
                    <div className="font-mono text-[10px] text-faint mt-1 truncate">
                      {v.policyHash ? `hash:${v.policyHash.slice(0, 8)}` : 'No hash'}
                    </div>
                    <div className="font-mono text-[10px] text-muted mt-0.5">
                      {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : 'Active'}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
