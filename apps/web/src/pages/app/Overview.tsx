import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShieldAlert,
  CheckCircle,
  Zap,
  ArrowUpRight,
  Shield,
  Clock,
  Lock,
  Layers,
} from 'lucide-react';
import { api } from '../../lib/api';
import {
  PageHeader,
  Metric,
  StatusBadge,
  EmptyState,
  LoadingState,
  Panel,
  Button,
} from '../../components/ui';

export default function Overview() {
  const [data, setData] = useState<any>(null);
  const [executions, setExecutions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getOverview().catch(() => null),
      api.getExecutions().catch(() => []),
      api.getEvents().catch(() => []),
      api.getApprovals().catch(() => []),
    ]).then(([overviewData, execData, eventsData, approvalsData]) => {
      setData(overviewData || { actions: 0, blocked: 0, interventions: 0, executions: 0 });
      setExecutions(execData.slice(0, 6));
      setEvents(eventsData);
      setApprovals(approvalsData.slice(0, 5));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingState message="Connecting to HEED runtime gateway..." className="h-full" />;
  }

  const blockedActions = events.filter((e) => e.type === 'ACTION_BLOCKED').slice(0, 5);
  const totalActions = data?.actions ?? 0;
  const blockedCount = data?.blocked ?? 0;
  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;
  const allowedCount = Math.max(0, totalActions - blockedCount - (data?.interventions ?? 0));

  const hasAnyData = totalActions > 0 || executions.length > 0;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Runtime Control Overview"
        subtitle="Live boundary monitoring, deterministic IFC verification, and human intervention posture."
        icon={Activity}
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-line bg-surface-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-allow animate-pulse" />
              Runtime Active
            </span>
          </div>
        }
      />

      {/* Metrics Grid (Always Real Data) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Metric
          label="Total Actions"
          value={totalActions}
          icon={Zap}
          sub="Observed runtime calls"
        />
        <Metric
          label="Allowed"
          value={allowedCount}
          color="var(--allow)"
          icon={CheckCircle}
          sub="Validated boundary egress"
        />
        <Metric
          label="Blocked"
          value={blockedCount}
          color="var(--block)"
          icon={ShieldAlert}
          sub="Hard IFC & No-Go blocks"
        />
        <Metric
          label="Pending Approvals"
          value={pendingCount}
          color="var(--ask)"
          icon={Lock}
          sub="Paused awaiting human"
        />
      </div>

      {!hasAnyData && (
        <div className="mb-8 p-6 rounded-2xl border border-line bg-surface shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-line">
            <div>
              <h3 className="text-base font-semibold text-fg">Welcome to HEED — Quickstart Guide</h3>
              <p className="text-xs text-muted mt-1">Get your autonomous agents governed in under 2 minutes.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/app/settings">
                <Button size="sm" variant="solid">Create API Key</Button>
              </Link>
              <Link to="/docs/quickstart">
                <Button size="sm" variant="outline">Read Quickstart</Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
            <div className="p-4 rounded-xl border border-line bg-surface-2/40">
              <div className="text-xs font-mono font-semibold text-accent mb-1">STEP 1</div>
              <h4 className="text-sm font-medium text-fg mb-1">Generate API Key</h4>
              <p className="text-xs text-muted mb-3">Create a secure runtime secret in your workspace settings.</p>
              <Link to="/app/settings" className="text-xs font-mono text-accent hover:underline">
                Go to Settings &rarr;
              </Link>
            </div>
            <div className="p-4 rounded-xl border border-line bg-surface-2/40">
              <div className="text-xs font-mono font-semibold text-accent mb-1">STEP 2</div>
              <h4 className="text-sm font-medium text-fg mb-1">Install the SDK</h4>
              <p className="text-xs text-muted mb-3">Install the published runtime package into your agent application.</p>
              <code className="text-[11px] font-mono bg-bg px-2 py-1 rounded border border-line block text-muted truncate">
                npm i @heed-ai/runtime
              </code>
            </div>
            <div className="p-4 rounded-xl border border-line bg-surface-2/40">
              <div className="text-xs font-mono font-semibold text-accent mb-1">STEP 3</div>
              <h4 className="text-sm font-medium text-fg mb-1">Execute Governed Actions</h4>
              <p className="text-xs text-muted mb-3">Wrap agent tool calls with <span className="font-mono text-fg">heed.execute()</span>.</p>
              <Link to="/docs/sdk" className="text-xs font-mono text-accent hover:underline">
                View Code Examples &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* Recent Executions Stream */}
            <div className="xl:col-span-2">
              <Panel
                title="Recent Agent Executions"
                subtitle="Trajectories evaluated under active policy snapshots"
                actions={
                  <Link
                    to="/app/executions"
                    className="font-mono text-xs text-muted hover:text-fg flex items-center gap-1 transition-colors"
                  >
                    All Executions <ArrowUpRight className="w-3 h-3" />
                  </Link>
                }
                bodyClassName="p-0 overflow-x-auto"
              >
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-line bg-surface-2/40 font-mono text-[10px] tracking-wider uppercase text-faint">
                      <th className="px-5 py-3 font-normal">Execution</th>
                      <th className="px-5 py-3 font-normal">Agent</th>
                      <th className="px-5 py-3 font-normal">Authority</th>
                      <th className="px-5 py-3 font-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executions.map((exec) => (
                      <tr
                        key={exec.id}
                        className="border-b border-line last:border-b-0 hover:bg-surface-2/60 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-mono">
                          <Link
                            to={`/app/executions/${exec.id}`}
                            className="text-fg hover:text-accent font-medium flex items-center gap-1.5"
                          >
                            <span>{exec.id.split('-')[0]}</span>
                          </Link>
                        </td>
                        <td className="px-5 py-3.5 text-muted font-sans font-medium">
                          {exec.agent?.name || exec.agentId || 'Unknown'}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-faint">
                          {exec.authorityType || 'SERVICE'}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={exec.status} />
                        </td>
                      </tr>
                    ))}
                    {executions.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-8 text-center font-mono text-xs text-faint"
                        >
                          No active executions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Panel>
            </div>

            {/* Runtime Boundary Posture */}
            <div>
              <Panel
                title="Runtime Gate Posture"
                subtitle="Gateway status & active enforcement"
                className="h-full flex flex-col"
              >
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between p-3 rounded border border-line bg-surface-2/30">
                    <span className="text-muted uppercase tracking-wider text-[11px]">
                      Policy Mode
                    </span>
                    <span className="text-allow font-bold">ENFORCE</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded border border-line bg-surface-2/30">
                    <span className="text-muted uppercase tracking-wider text-[11px]">
                      Fail Mode
                    </span>
                    <span className="text-block font-bold">FAIL_CLOSED</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded border border-line bg-surface-2/30">
                    <span className="text-muted uppercase tracking-wider text-[11px]">
                      Cryptographic Hashing
                    </span>
                    <span className="text-fg">SHA-256</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded border border-line bg-surface-2/30">
                    <span className="text-muted uppercase tracking-wider text-[11px]">
                      Taint Propagation
                    </span>
                    <span className="text-allow">STRICT</span>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-line text-xs font-mono text-faint">
                  Boundaries enforced deterministically prior to connector invocation.
                </div>
              </Panel>
            </div>
          </div>

          {/* Blocked Actions Panel */}
          {blockedActions.length > 0 && (
            <Panel
              title="Recent Blocked Actions"
              subtitle="Actions halted due to provenance egress or trajectory violations"
              actions={
                <Link
                  to="/app/audit"
                  className="font-mono text-xs text-muted hover:text-fg flex items-center gap-1 transition-colors"
                >
                  Full Audit Log <ArrowUpRight className="w-3 h-3" />
                </Link>
              }
              bodyClassName="p-0 overflow-x-auto"
            >
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-line bg-surface-2/40 font-mono text-[10px] tracking-wider uppercase text-faint">
                    <th className="px-5 py-3 font-normal">Action Target</th>
                    <th className="px-5 py-3 font-normal">Provenance → Destination</th>
                    <th className="px-5 py-3 font-normal">Decision Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedActions.map((evt) => {
                    const p = evt.payload;
                    return (
                      <tr
                        key={evt.id}
                        className="border-b border-line last:border-b-0 hover:bg-surface-2/60 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-mono text-block font-medium">
                          {p?.action?.system}.{p?.action?.operation}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-muted">
                          {(p?.action?.provenanceLabels || []).join(', ') || 'NONE'} →{' '}
                          {p?.action?.destinationType || p?.action?.destinationIdentifier || 'EXTERNAL'}
                        </td>
                        <td
                          className="px-5 py-3.5 text-muted truncate max-w-xs font-mono text-xs"
                          title={p?.decision?.reasons?.[0]}
                        >
                          {p?.decision?.reasons?.[0] || 'Violation of Information-Flow Control'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Panel>
          )}
    </div>
  );
}
