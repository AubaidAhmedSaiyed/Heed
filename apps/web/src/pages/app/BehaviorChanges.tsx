import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function BehaviorChanges() {
  const [changes, setChanges] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/behavior-changes")
      .then(res => res.json())
      .then(setChanges)
      .catch(console.error);
  }, []);

  return (
    <div className="p-8 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold">Behavior Changes</h2>
      </div>
      <p className="text-gray-500 mb-8 max-w-3xl">
        This view deterministically tracks when agents exhibit behavior that breaks established execution trajectory rules, such as capability escalation or severe objective deviation.
      </p>
      
      <div className="space-y-4">
        {changes.map(change => (
          <div key={change.id} className="bg-white border-l-4 border-red-500 rounded-r-lg p-6 shadow-sm flex flex-col md:flex-row gap-6 md:items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-lg">{change.agentName}</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-500">
                  <Link to={`/app/executions/${change.executionId}`} className="hover:underline">
                    exec: {change.executionId.split('-')[0]}
                  </Link>
                </span>
              </div>
              
              <div className="flex flex-col gap-1">
                {change.reasons.map((r: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-700">{r}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-red-50 rounded p-4 shrink-0 text-center md:text-right border border-red-100">
              <span className="text-xs text-red-500 uppercase font-bold block mb-1">Target Capability</span>
              <span className="font-mono text-sm bg-white border border-red-200 px-2 py-1 rounded text-red-700">
                {change.capability || "unknown"}
              </span>
            </div>
          </div>
        ))}
        {changes.length === 0 && (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
            No recent capability escalations or objective deviations detected.
          </div>
        )}
      </div>
    </div>
  );
}
