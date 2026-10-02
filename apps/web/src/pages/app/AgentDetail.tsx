import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Zap, Server, ArrowLeft, Users, Activity, CheckCircle, ShieldAlert, Lock } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, Metric, Panel, StatusBadge, LoadingState } from '../../components/ui';

export default function AgentDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getAgent(id)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !data) {
    return <LoadingState message="Loading agent details..." />;
  }

  const totalActions = data.metrics?.totalActions || 1;
  const allowPct = totalActions > 0 ? ((data.metrics?.allowed || 0) / totalActions * 100).toFixed(1) : '0.0';
  const blockPct = totalActions > 0 ? ((data.metrics?.blocked || 0) / totalActions * 100).toFixed(1) : '0.0';

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-4">
        <Link to="/app/agents" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted hover:text-fg transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to Agents
        </Link>
      </div>

      <PageHeader
        title={data.name}
        subtitle={data.id}
        icon={Users}
        actions={
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] tracking-wider px-2 py-0.5 rounded border border-[rgba(78,158,106,.3)] bg-[rgba(78,158,106,.08)] text-allow font-bold">ACTIVE</span>
          </div>
        }
      />

      {data.description && (
        <p className="text-sm text-muted mb-8 max-w-2xl">{data.description}</p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Metric label="Total actions" value={data.metrics?.totalActions || 0} icon={Activity} />
        <Metric label="Allowed" value={`${allowPct}%`} color="var(--allow)" icon={CheckCircle} />
        <Metric label="Blocked" value={`${blockPct}%`} color="var(--block)" icon={ShieldAlert} />
        <Metric label="Human asks" value={data.metrics?.askCount || 0} color="var(--ask)" icon={Lock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Panel title="Capability usage">
          <div className="space-y-1">
            {Object.entries(data.metrics?.capabilityUsage || {}).sort((a: any, b: any) => b[1] - a[1]).map(([cap, count]: any) => (
              <div key={cap} className="flex justify-between items-center py-2 border-b border-line last:border-b-0">
                <span className="font-mono text-xs text-muted">{cap}</span>
                <span className="font-mono text-xs text-fg">{count}</span>
              </div>
            ))}
            {Object.keys(data.metrics?.capabilityUsage || {}).length === 0 && (
              <span className="text-xs text-faint italic font-mono">No capabilities recorded.</span>
            )}
          </div>
        </Panel>

        <Panel title="Systems accessed">
          <div className="space-y-1">
            {Object.entries(data.metrics?.systemUsage || {}).sort((a: any, b: any) => b[1] - a[1]).map(([sys, count]: any) => (
              <div key={sys} className="flex justify-between items-center py-2 border-b border-line last:border-b-0">
                <span className="font-mono text-xs text-muted">{sys}</span>
                <span className="font-mono text-xs text-fg">{count}</span>
              </div>
            ))}
            {Object.keys(data.metrics?.systemUsage || {}).length === 0 && (
              <span className="text-xs text-faint italic font-mono">No systems recorded.</span>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Recent executions" bodyClassName="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-line bg-surface-2/40 font-mono text-[10px] tracking-wider uppercase text-faint">
              <th className="px-5 py-3 font-normal">ID</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal">Objective</th>
              <th className="px-5 py-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data.executions || []).map((exec: any) => (
              <tr key={exec.id} className="border-b border-line last:border-b-0 hover:bg-surface-2/60 transition-colors">
                <td className="px-5 py-3.5 font-mono">
                  <Link to={`/app/executions/${exec.id}`} className="text-accent hover:underline">
                    {exec.id.split('-')[0]}
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={exec.status} />
                </td>
                <td className="px-5 py-3.5 text-muted truncate max-w-xs">{exec.objective}</td>
                <td className="px-5 py-3.5 font-mono text-muted">{exec._count?.actions ?? 0}</td>
              </tr>
            ))}
            {(!data.executions || data.executions.length === 0) && (
              <tr><td colSpan={4} className="px-5 py-8 text-center font-mono text-xs text-faint">No executions found.</td></tr>
            )}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
