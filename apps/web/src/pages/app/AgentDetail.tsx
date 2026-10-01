import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Zap, Server, ArrowLeft, Users } from 'lucide-react';
import { api } from '../../lib/api';

function Metric({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="border border-[var(--line)] rounded-[8px] bg-[var(--surface)] p-5">
      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--faint)]">{label}</span>
      <p className="text-[28px] font-medium tracking-tight leading-none mt-2" style={{ color: color || 'var(--fg)' }}>{value}</p>
    </div>
  );
}

export default function AgentDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    api.getAgent(id)
      .then(setData)
      .catch(console.error);
  }, [id]);

  if (!data) return (
    <div className="flex-1 flex items-center justify-center bg-[var(--bg)] text-[var(--fg)]">
      <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--faint)] animate-pulse">Loading agent...</div>
    </div>
  );

  const totalActions = data.metrics?.totalActions || 1;
  const allowPct = ((data.metrics?.allowed || 0) / totalActions * 100).toFixed(1);
  const blockPct = ((data.metrics?.blocked || 0) / totalActions * 100).toFixed(1);

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[var(--bg)] text-[var(--fg)]">
      <div className="max-w-5xl mx-auto">
        <Link to="/app/agents" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] hover:text-[var(--fg)] transition-colors mb-6">
          <ArrowLeft className="w-3 h-3" /> Back to agents
        </Link>

        <div className="flex items-center justify-between mb-8 border-b border-[var(--line)] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[8px] bg-[var(--surface-2)] flex items-center justify-center border border-[var(--line)]">
              <Users className="w-6 h-6 text-[var(--muted)]" />
            </div>
            <div>
              <h1 className="text-[20px] font-medium tracking-tight flex items-center gap-2 mb-1">
                {data.name}
              </h1>
              <p className="font-mono text-[11px] text-[var(--muted)]">{data.id}</p>
            </div>
          </div>
          <span className="font-mono text-[9px] tracking-wider px-2 py-0.5 rounded border border-[rgba(78,158,106,.3)] bg-[rgba(78,158,106,.08)] text-[var(--allow-lit)]">ACTIVE</span>
        </div>

        {data.description && <p className="text-[13px] text-[var(--muted)] mb-8 max-w-2xl">{data.description}</p>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Metric label="Total actions" value={data.metrics?.totalActions || 0} />
          <Metric label="Allowed" value={`${allowPct}%`} color="var(--allow-lit)" />
          <Metric label="Blocked" value={`${blockPct}%`} color="var(--block-lit)" />
          <Metric label="Human asks" value={data.metrics?.askCount || 0} color="var(--ask-lit)" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="border border-[var(--line)] rounded-[8px] bg-[var(--surface)] p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--line)] pb-4">
              <Zap className="w-4 h-4 text-[var(--ask-lit)]" />
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--faint)]">Capability usage</span>
            </div>
            <div className="space-y-1">
              {Object.entries(data.metrics?.capabilityUsage || {}).sort((a: any, b: any) => b[1] - a[1]).map(([cap, count]: any) => (
                <div key={cap} className="flex justify-between items-center py-2 border-b border-[var(--line)] last:border-b-0">
                  <span className="font-mono text-[11px] text-[var(--muted)]">{cap}</span>
                  <span className="font-mono text-[11px] text-[var(--fg)]">{count}</span>
                </div>
              ))}
              {Object.keys(data.metrics?.capabilityUsage || {}).length === 0 && (
                <span className="text-[11px] text-[var(--faint)] italic">No capabilities recorded.</span>
              )}
            </div>
          </div>

          <div className="border border-[var(--line)] rounded-[8px] bg-[var(--surface)] p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-[var(--line)] pb-4">
              <Server className="w-4 h-4 text-[var(--allow-lit)]" />
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--faint)]">Systems accessed</span>
            </div>
            <div className="space-y-1">
              {Object.entries(data.metrics?.systemUsage || {}).sort((a: any, b: any) => b[1] - a[1]).map(([sys, count]: any) => (
                <div key={sys} className="flex justify-between items-center py-2 border-b border-[var(--line)] last:border-b-0">
                  <span className="font-mono text-[11px] text-[var(--muted)]">{sys}</span>
                  <span className="font-mono text-[11px] text-[var(--fg)]">{count}</span>
                </div>
              ))}
              {Object.keys(data.metrics?.systemUsage || {}).length === 0 && (
                <span className="text-[11px] text-[var(--faint)] italic">No systems recorded.</span>
              )}
            </div>
          </div>
        </div>

        <div className="border border-[var(--line)] rounded-[8px] bg-[var(--surface)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--line)] flex justify-between items-center bg-[var(--surface-2)]">
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--faint)]">Recent executions</span>
          </div>
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--line)]">
                <th className="px-5 py-3 font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--faint)] font-normal">ID</th>
                <th className="px-5 py-3 font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--faint)] font-normal">Status</th>
                <th className="px-5 py-3 font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--faint)] font-normal">Objective</th>
                <th className="px-5 py-3 font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--faint)] font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data.executions || []).map((exec: any) => (
                <tr key={exec.id} className="border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--surface-2)]">
                  <td className="px-5 py-4 font-mono text-[11px]">
                    <Link to={`/app/executions/${exec.id}`} className="text-[var(--allow-lit)] hover:underline">
                      {exec.id.split('-')[0]}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-mono text-[9px] tracking-[0.1em] px-1.5 py-0.5 rounded border ${
                      exec.status === 'COMPLETED' ? 'text-[var(--allow-lit)] border-[rgba(78,158,106,.3)] bg-[rgba(78,158,106,.08)]' :
                      exec.status === 'BLOCKED' || exec.status === 'TERMINATED' ? 'text-[var(--block-lit)] border-[rgba(196,73,78,.3)] bg-[rgba(196,73,78,.08)]' :
                      'text-[var(--ask-lit)] border-[rgba(194,145,63,.3)] bg-[rgba(194,145,63,.08)]'
                    }`}>{exec.status}</span>
                  </td>
                  <td className="px-5 py-4 text-[12px] text-[var(--muted)] truncate max-w-xs">{exec.objective}</td>
                  <td className="px-5 py-4 font-mono text-[11px] text-[var(--muted)]">{exec._count?.actions ?? 0}</td>
                </tr>
              ))}
              {(!data.executions || data.executions.length === 0) && (
                <tr><td colSpan={4} className="px-5 py-8 text-center font-mono text-[11px] text-[var(--faint)]">No executions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
