import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Zap, AlertTriangle, Activity, Server } from 'lucide-react';

export default function AgentDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:4000/api/agents/${id}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [id]);

  if (!data) return <div className="p-8">Loading agent...</div>;

  const totalActions = data.metrics.totalActions || 1;
  const allowPct = ((data.metrics.allowed / totalActions) * 100).toFixed(1);
  const blockPct = ((data.metrics.blocked / totalActions) * 100).toFixed(1);

  return (
    <div className="p-8 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">{data.name}</h2>
        <p className="text-[var(--faint)]">{data.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--surface)] p-6 rounded-lg border border-[var(--line)] shadow-none">
          <p className="text-sm font-medium text-[var(--faint)] mb-1">Total Actions</p>
          <p className="text-3xl font-bold">{data.metrics.totalActions}</p>
        </div>
        <div className="bg-[var(--surface)] p-6 rounded-lg border border-[var(--line)] shadow-none">
          <p className="text-sm font-medium text-[var(--faint)] mb-1">Allowed</p>
          <p className="text-3xl font-bold text-emerald-600">{allowPct}%</p>
        </div>
        <div className="bg-[var(--surface)] p-6 rounded-lg border border-[var(--line)] shadow-none">
          <p className="text-sm font-medium text-[var(--faint)] mb-1">Blocked</p>
          <p className="text-3xl font-bold text-red-600">{blockPct}%</p>
        </div>
        <div className="bg-[var(--surface)] p-6 rounded-lg border border-[var(--line)] shadow-none">
          <p className="text-sm font-medium text-[var(--faint)] mb-1">Human Asks</p>
          <p className="text-3xl font-bold text-amber-600">{data.metrics.askCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Capability Usage */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-6 shadow-none">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-purple-600" /> Capability Usage</h3>
          <ul className="space-y-3">
            {Object.entries(data.metrics.capabilityUsage).sort((a: any, b: any) => b[1] - a[1]).map(([cap, count]: any) => (
              <li key={cap} className="flex justify-between items-center text-sm">
                <span className="font-mono bg-[var(--line)] px-2 py-1 rounded">{cap}</span>
                <span className="font-bold">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* System Usage & Impact */}
        <div className="space-y-8">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-6 shadow-none">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Server className="w-4 h-4 text-[var(--allow-lit)]" /> Systems Accessed</h3>
            <ul className="space-y-3">
              {Object.entries(data.metrics.systemUsage).sort((a: any, b: any) => b[1] - a[1]).map(([sys, count]: any) => (
                <li key={sys} className="flex justify-between items-center text-sm">
                  <span className="font-mono bg-[var(--line)] px-2 py-1 rounded">{sys}</span>
                  <span className="font-bold">{count}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-6 shadow-none">
            <h3 className="font-bold mb-4">Impact Distribution</h3>
            <div className="flex gap-4 text-sm">
              <div className="bg-red-50 text-red-700 px-3 py-2 rounded flex-1 text-center">
                <span className="block font-bold">{data.metrics.impactDistribution.HIGH}</span> HIGH
              </div>
              <div className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded flex-1 text-center">
                <span className="block font-bold">{data.metrics.impactDistribution.MEDIUM}</span> MEDIUM
              </div>
              <div className="bg-[var(--line)] text-[var(--fg)] px-3 py-2 rounded flex-1 text-center">
                <span className="block font-bold">{data.metrics.impactDistribution.LOW}</span> LOW
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-6 shadow-none">
        <h3 className="font-bold mb-4">Recent Executions</h3>
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--bg)] border-b border-[var(--line)] text-[var(--faint)]">
            <tr>
              <th className="px-4 py-2 font-medium">ID</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Objective</th>
              <th className="px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {data.executions.map((exec: any) => (
              <tr key={exec.id}>
                <td className="px-4 py-3 font-mono text-xs">
                  <Link to={`/app/executions/${exec.id}`} className="text-[var(--allow-lit)] hover:underline">
                    {exec.id.split('-')[0]}...
                  </Link>
                </td>
                <td className="px-4 py-3 font-bold">{exec.status}</td>
                <td className="px-4 py-3 truncate max-w-xs">{exec.objective}</td>
                <td className="px-4 py-3">{exec._count.actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
