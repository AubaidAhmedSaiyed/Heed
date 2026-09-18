import React, { useEffect, useState } from 'react';
import { Activity, ShieldAlert, CheckCircle, Zap } from 'lucide-react';

export default function Overview() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/overview")
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div className="p-8">Loading overview...</div>;

  return (
    <div className="p-8 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">HEED Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--surface)] p-6 rounded-lg border border-[var(--line)] shadow-none">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--faint)]">Total Executions</h3>
            <Activity className="text-blue-500 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">{data.executions}</p>
        </div>
        
        <div className="bg-[var(--surface)] p-6 rounded-lg border border-[var(--line)] shadow-none">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--faint)]">Total Actions</h3>
            <Zap className="text-purple-500 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">{data.actions}</p>
        </div>
        
        <div className="bg-[var(--surface)] p-6 rounded-lg border border-[var(--line)] shadow-none">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--faint)]">Actions Blocked</h3>
            <ShieldAlert className="text-red-500 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-red-600">{data.blocked}</p>
          <p className="text-xs text-[var(--faint)] mt-1">{((data.blocked / data.actions) * 100 || 0).toFixed(1)}% of total</p>
        </div>
        
        <div className="bg-[var(--surface)] p-6 rounded-lg border border-[var(--line)] shadow-none">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--faint)]">Human Interventions</h3>
            <CheckCircle className="text-amber-500 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-amber-600">{data.interventions}</p>
        </div>
      </div>

      <div className="bg-[var(--surface-2)] p-6 rounded-lg border border-[var(--line)]">
        <h3 className="text-lg font-bold mb-4">Action Impact Distribution</h3>
        <div className="flex items-center gap-8">
          <div>
            <p className="text-sm text-[var(--faint)] mb-1">High Impact Actions</p>
            <p className="text-2xl font-bold text-red-600">{data.highImpact}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--faint)] mb-1">Standard Actions</p>
            <p className="text-2xl font-bold text-[var(--fg)]">{data.actions - data.highImpact}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
