import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function ExecutionsList() {
  const [executions, setExecutions] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/executions")
      .then(res => res.json())
      .then(setExecutions)
      .catch(console.error);
  }, []);

  return (
    <div className="p-8 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Recent Executions</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Execution ID</th>
              <th className="px-6 py-3 font-medium">Agent</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Mode</th>
              <th className="px-6 py-3 font-medium">Actions</th>
              <th className="px-6 py-3 font-medium">Objective</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {executions.map(exec => (
              <tr key={exec.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-xs">
                  <Link to={`/app/executions/${exec.id}`} className="text-blue-600 hover:underline">
                    {exec.id.split('-')[0]}...
                  </Link>
                </td>
                <td className="px-6 py-4 font-medium">{exec.agent.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    exec.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                    exec.status === 'BLOCKED' ? 'bg-red-100 text-red-700' :
                    exec.status === 'TERMINATED' ? 'bg-gray-800 text-white' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {exec.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                    {exec.evaluationMode}
                  </span>
                </td>
                <td className="px-6 py-4">{exec._count.actions}</td>
                <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]" title={exec.objective}>
                  {exec.objective}
                </td>
              </tr>
            ))}
            {executions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No executions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
