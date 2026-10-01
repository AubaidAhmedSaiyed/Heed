import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Activity } from 'lucide-react';
import { api } from '../../lib/api';

export default function AgentsList() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAgents()
      .then(d => {
        setAgents(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 overflow-auto bg-[var(--bg)] text-[var(--fg)] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-[var(--line)] pb-6">
          <div>
            <h1 className="text-[20px] font-medium tracking-tight flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-[var(--allow-lit)]" />
              Registered Agents
            </h1>
            <p className="font-mono text-[12px] text-[var(--muted)] max-w-2xl">
              Autonomous entities interacting with the HEED SDK runtime.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center font-mono text-[11px] text-[var(--faint)] animate-pulse py-12">Loading agents...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.length === 0 && (
              <div className="col-span-full text-center py-12 border border-[var(--line)] rounded-[8px] bg-[var(--surface)]">
                <Users className="w-8 h-8 text-[var(--line-strong)] mx-auto mb-3" />
                <p className="font-mono text-[11px] text-[var(--faint)]">HEED has not observed an agent execution.</p>
              </div>
            )}
            {agents.map(agent => (
              <Link key={agent.id} to={`/app/agents/${agent.id}`} className="block group">
                <div className="border border-[var(--line)] rounded-[8px] bg-[var(--surface)] p-6 hover:border-[var(--line-strong)] transition-colors relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-[var(--allow)] opacity-30 group-hover:opacity-60 transition-opacity" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[6px] bg-[var(--surface-2)] flex items-center justify-center border border-[var(--line)]">
                        <Users className="w-5 h-5 text-[var(--muted)]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[16px]">{agent.name}</h3>
                        <p className="font-mono text-[10px] text-[var(--faint)] mt-1">{agent.id}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[9px] tracking-wider px-2 py-0.5 rounded border border-[rgba(78,158,106,.3)] bg-[rgba(78,158,106,.08)] text-[var(--allow-lit)]">ACTIVE</span>
                  </div>
                  
                  <p className="text-[13px] text-[var(--muted)] mb-6 line-clamp-2 min-h-[40px]">{agent.description || "No description provided."}</p>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-4">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--faint)] block mb-1">SDK Version</span>
                      <span className="font-mono text-[11px] text-[var(--fg)]">v1.0 (Latest)</span>
                    </div>
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--faint)] block mb-1">Total Executions</span>
                      <div className="flex items-center gap-1.5 font-mono text-[12px] text-[var(--fg)]">
                        <Activity className="w-3.5 h-3.5 text-[var(--muted)]" />
                        {agent._count?.executions ?? 0}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
