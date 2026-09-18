import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

export default function AgentsList() {
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/agents")
      .then(res => res.json())
      .then(setAgents)
      .catch(console.error);
  }, []);

  return (
    <div className="p-8 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-[var(--allow-lit)]" />
        <h2 className="text-2xl font-bold">Agents</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <Link key={agent.id} to={`/app/agents/${agent.id}`} className="block">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-6 shadow-none hover:shadow-none transition-shadow cursor-pointer">
              <h3 className="font-bold text-lg mb-2">{agent.name}</h3>
              <p className="text-sm text-[var(--faint)] mb-4">{agent.description || "No description provided."}</p>
              
              <div className="flex justify-between items-center text-sm border-t border-[var(--line)] pt-4">
                <span className="text-[var(--faint)]">Total Executions</span>
                <span className="font-bold">{agent._count.executions}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
