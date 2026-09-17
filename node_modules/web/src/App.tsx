import { useState, useEffect } from 'react';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { AlertTriangle, CheckCircle, XCircle, Clock, Server, Shield } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<any>(null);
  const [interventions, setInterventions] = useState<any[]>([]);
  const execId = "test-exec-1";

  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/executions/${execId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
      
      const resInterventions = await fetch(`http://localhost:4000/interventions`);
      if (resInterventions.ok) {
        const json = await resInterventions.json();
        setInterventions(json);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id: string, decision: string) => {
    await fetch(`http://localhost:4000/interventions/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision })
    });
    fetchData();
  };

  if (!data) {
    return <div className="flex h-screen items-center justify-center">Connecting to HEED Runtime...</div>;
  }

  // Map backend graph data to ReactFlow
  const flowNodes = data.nodes.map((n: any) => ({
    id: n.id,
    position: n.position,
    data: { 
      label: (
        <div className="flex flex-col items-center justify-center text-sm">
          <div className="font-bold">{n.data.label}</div>
          {n.data.status === 'ALLOWED' && <CheckCircle className="text-emerald-500 w-4 h-4 mt-1" />}
          {n.data.status === 'BLOCKED' && <XCircle className="text-red-500 w-4 h-4 mt-1" />}
          {n.data.status === 'REQUESTED' && <Clock className="text-yellow-500 w-4 h-4 mt-1 animate-pulse" />}
          <div className="text-xs text-gray-500 mt-1">{n.data.resource}</div>
        </div>
      )
    },
    style: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '10px',
      background: 'white',
      minWidth: '150px'
    }
  }));

  const flowEdges = data.edges.map((e: any) => ({
    ...e,
    markerEnd: { type: MarkerType.ArrowClosed }
  }));

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar: Live Execution & Interventions */}
      <div className="w-1/3 p-6 border-r border-gray-200 bg-white flex flex-col gap-6 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
            <Shield className="text-blue-600" />
            HEED Control Plane
          </h1>
          <p className="text-sm text-gray-500">Runtime control for autonomous software.</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-slate-50">
          <h2 className="text-xs uppercase font-semibold text-gray-500 tracking-wider mb-3">Live Execution</h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Agent</span>
              <span className="text-sm font-medium">{data.execution.agentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Objective</span>
              <span className="text-sm font-medium text-right max-w-[200px] truncate">{data.execution.objective}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">State</span>
              <span className="text-sm font-bold text-blue-600">{data.execution.status}</span>
            </div>
          </div>
        </div>

        {/* Current Action (Last event in timeline) */}
        {data.timeline.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h2 className="text-xs uppercase font-semibold text-gray-500 tracking-wider mb-3">Current Action</h2>
            {(() => {
              const last = data.timeline[data.timeline.length - 1];
              return (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{last.system}.{last.operation}</span>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                      last.status === 'ALLOWED' || last.status === 'EXECUTED' ? 'bg-emerald-100 text-emerald-700' :
                      last.status === 'BLOCKED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {last.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Resource</span>
                    <p className="text-sm">{last.resource}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Capability</span>
                    <p className="text-sm">{last.capability}</p>
                  </div>
                  {last.decision && (
                    <div className="bg-red-50 p-3 rounded mt-2 border border-red-100">
                      <span className="text-xs text-red-600 font-bold uppercase">Decision Reasons</span>
                      <ul className="list-disc pl-4 text-xs text-red-800 mt-1">
                        {last.decision.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Interventions Panel */}
        {interventions.length > 0 && (
          <div className="border-2 border-yellow-400 bg-yellow-50 rounded-lg p-4 shadow-sm animate-pulse-slow">
            <h2 className="text-sm font-bold text-yellow-800 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" />
              Action Requires Approval
            </h2>
            {interventions.map((inv) => (
              <div key={inv.id} className="flex flex-col gap-3">
                <div className="text-xs text-yellow-900 bg-yellow-100 p-2 rounded">
                  <span className="font-bold">Paused Action:</span> {inv.action.system}.{inv.action.operation} on {inv.action.resource}
                </div>
                <div className="text-xs text-yellow-900">
                  <span className="font-bold">Reason:</span> {inv.decision.reasons.join(", ")}
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <button onClick={() => handleResolve(inv.id, 'ALLOW_ONCE')} className="bg-emerald-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-emerald-700">Approve Once</button>
                  <button onClick={() => handleResolve(inv.id, 'BLOCK')} className="bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-700">Block Action</button>
                  <button onClick={() => handleResolve(inv.id, 'TERMINATE_EXECUTION')} className="bg-gray-800 text-white px-3 py-2 rounded text-sm font-medium hover:bg-gray-900">Terminate Execution</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 bg-slate-50 relative">
        <div className="absolute top-4 left-4 z-10 bg-white px-4 py-2 rounded shadow-sm border border-gray-200 text-sm font-medium text-gray-600 flex items-center gap-2">
          <Server className="w-4 h-4" />
          Execution Trajectory Graph
        </div>
        <ReactFlow 
          nodes={flowNodes} 
          edges={flowEdges} 
          fitView 
          attributionPosition="bottom-right"
        >
          <Background color="#ccc" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
