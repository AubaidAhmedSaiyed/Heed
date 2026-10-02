import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Activity } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, EmptyState, LoadingState, Panel } from '../../components/ui';

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

  if (loading) {
    return <LoadingState message="Loading agents..." />;
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Registered Agents"
        subtitle="External autonomous entities integrated with the HEED SDK runtime."
        icon={Users}
      />

      {agents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No agents registered."
          description="Register an existing agent to obtain an identity for the SDK."
          actionText="Register Agent"
          actionHref="/app/onboarding"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map(agent => (
            <Link key={agent.id} to={`/app/agents/${agent.id}`} className="block group">
              <Panel className="h-full hover:border-line-strong transition-colors cursor-pointer group-hover:bg-surface-2/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-surface-2 flex items-center justify-center border border-line">
                      <Users className="w-5 h-5 text-muted" />
                    </div>
                    <div>
                      <h3 className="font-medium text-fg">{agent.name}</h3>
                      <p className="font-mono text-[10px] text-faint mt-0.5">{agent.id}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted mb-6 line-clamp-2 min-h-[40px]">
                  {agent.description || "No description provided."}
                </p>
                
                <div className="border-t border-line pt-4 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-faint">
                    Total Executions
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-fg">
                    <Activity className="w-3.5 h-3.5 text-muted" />
                    {agent._count?.executions ?? 0}
                  </div>
                </div>
              </Panel>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
