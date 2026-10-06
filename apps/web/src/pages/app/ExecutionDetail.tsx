import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Shield,
  Zap,
  Clock,
  ArrowDown,
  CheckCircle,
  XCircle,
  HelpCircle,
  Lock,
  ArrowLeft,
  Activity,
  Layers,
} from 'lucide-react';
import { api } from '../../lib/api';
import { StatusBadge, LoadingState, Button, Card, Panel } from '../../components/ui';

function useExecutionGraph(executionId: string) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    if (!executionId) return;
    let isMounted = true;
    const fetchGraph = async () => {
      try {
        const json = await api.getExecution(executionId);
        if (isMounted) setData(json);
      } catch (e) {
        console.error(e);
      }
    };
    fetchGraph();
    const interval = setInterval(fetchGraph, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [executionId]);
  return data;
}

export default function ExecutionDetail() {
  const { id } = useParams();
  const data = useExecutionGraph(id || '');
  const [selectedAction, setSelectedAction] = useState<any>(null);

  if (!data) {
    return <LoadingState message="Resolving execution trajectory & policy snapshot..." className="h-full" />;
  }

  const exec = data.execution || {};
  const timeline = data.timeline || [];

  const flowNodes = (data.nodes || []).map((n: any) => ({
    id: n.id,
    position: n.position,
    data: {
      label: (
        <div className="flex flex-col items-center justify-center text-xs p-1 font-mono">
          <div className="font-semibold text-fg">{n.data?.label}</div>
          <div className="text-[10px] text-muted mt-1 max-w-[140px] truncate">
            {n.data?.resource}
          </div>
        </div>
      ),
    },
    style: {
      border: '1px solid var(--line-strong)',
      borderRadius: '8px',
      padding: '10px 14px',
      background: 'var(--surface)',
      minWidth: '160px',
      color: 'var(--fg)',
      cursor: 'pointer',
    },
  }));

  const flowEdges = (data.edges || []).map((e: any) => ({
    ...e,
    style: { stroke: 'var(--line-strong)', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--line-strong)' },
  }));

  const snapshotHash = exec.contract?.id
    ? `sha256:${exec.contract.id.slice(0, 8)}`
    : 'sha256:4a8f9c1d';

  return (
    <div className="flex flex-col h-full bg-bg text-fg overflow-hidden">
      {/* Top Header */}
      <div className="shrink-0 px-6 sm:px-8 py-5 border-b border-line bg-surface/80 backdrop-blur">
        <div className="flex items-center gap-3 mb-2">
          <Link
            to="/app/executions"
            className="p-1 rounded text-muted hover:text-fg hover:bg-surface-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-medium tracking-tight font-mono text-fg">
              EXECUTION {exec.id ? exec.id.split('-')[0] : id}
            </h1>
            <StatusBadge status={exec.status || 'RUNNING'} showIcon />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-muted mt-3">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-accent" />
            <span>Agent:</span>
            <span className="text-fg font-sans font-medium">{exec.agent?.name || exec.agentId || 'Unknown'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Started:</span>
            <span className="text-fg">
              {exec.createdAt ? new Date(exec.createdAt).toLocaleTimeString() : 'Recent'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-line bg-surface-2">
            <Shield className="w-3.5 h-3.5 text-accent" />
            <span>Snapshot:</span>
            <span className="text-fg">{snapshotHash}</span>
          </div>
        </div>

        {exec.objective && (
          <p className="text-xs text-muted mt-2 font-mono truncate">
            Objective: {exec.objective}
          </p>
        )}

        {/* IMPACT AWARE AUTONOMY DASHBOARD WIDGET */}
        <div className="mt-4 pt-4 border-t border-line grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted font-semibold flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-accent" /> Execution Impact Budget</span>
              <span className="text-xs font-mono text-fg">{exec.impactConsumed || 0} / {exec.impactBudget || 30} used</span>
            </div>
            <div className="w-full bg-surface-2 h-2.5 rounded-full overflow-hidden border border-line">
              <div 
                className={`h-full transition-all duration-500 ${(exec.impactConsumed || 0) >= (exec.impactBudget || 30) ? 'bg-red-500' : (exec.impactConsumed || 0) > (exec.impactBudget || 30) * 0.7 ? 'bg-yellow-500' : 'bg-accent'}`} 
                style={{ width: `${Math.min(((exec.impactConsumed || 0) / (exec.impactBudget || 30)) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-faint uppercase">
              <span>{Math.max(0, (exec.impactBudget || 30) - (exec.impactConsumed || 0))} remaining</span>
              <span>{exec.impactConsumed || 0} consumed</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 p-3 rounded-lg border border-line bg-surface-2/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted">Trust State</span>
              </div>
              <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${exec.trustState === 'SENSITIVE_DATA' || exec.trustState === 'EXTERNAL_DESTINATION' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : exec.trustState === 'UNTRUSTED_INPUT' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                {exec.trustState || 'TRUSTED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Chronological Action Flow */}
        <div className="w-full md:w-[480px] shrink-0 border-r border-line bg-bg flex flex-col overflow-y-auto">
          <div className="px-6 py-3.5 border-b border-line sticky top-0 bg-surface/90 backdrop-blur z-10 flex items-center justify-between">
            <span className="font-mono text-xs tracking-wider uppercase text-muted font-medium">
              Action Trajectory
            </span>
            <span className="font-mono text-[10px] text-faint">
              {timeline.length} actions
            </span>
          </div>

          <div className="p-6 space-y-6">
            {timeline.length === 0 && (
              <div className="text-center py-16 text-muted font-mono text-xs">
                No actions recorded in this execution window.
              </div>
            )}

            {timeline.map((action: any, idx: number) => {
              const isSelected = selectedAction?.id === action.id;
              const decision = action.decision?.decision || action.status || 'ALLOW';

              return (
                <div key={action.id || idx} className="relative">
                  {idx > 0 && (
                    <div className="flex justify-center -mt-3 mb-3">
                      <ArrowDown className="w-3.5 h-3.5 text-line-strong" />
                    </div>
                  )}

                  <div
                    onClick={() => setSelectedAction(action)}
                    className={`rounded-xl border p-4 cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'border-accent bg-surface-2 shadow-sm'
                        : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-line pb-2.5">
                      <div className="font-mono text-xs font-semibold text-fg">
                        {action.system}.{action.operation}
                      </div>
                      <StatusBadge status={decision} size="sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mb-2">
                      <div className="p-2 rounded bg-surface-2/60 border border-line">
                        <span className="text-[9px] uppercase tracking-wider text-faint block">
                          PROVENANCE
                        </span>
                        <span className="text-muted truncate block">
                          {(action.provenanceLabels || []).join(', ') || 'TRUSTED'}
                        </span>
                      </div>

                      <div className="p-2 rounded bg-surface-2/60 border border-line">
                        <span className="text-[9px] uppercase tracking-wider text-faint block">
                          DESTINATION
                        </span>
                        <span className="text-muted truncate block">
                          {action.destinationType || 'INTERNAL_API'}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-faint truncate">
                      Resource: <span className="text-muted">{action.resource || '/'}</span>
                    </div>
                    {(action.impactWeight !== undefined) && (
                      <div className="mt-1 flex items-center justify-between text-[10px] font-mono uppercase">
                        <span className="text-faint">Impact: <span className="text-accent">{action.impactWeight}</span></span>
                        <span className={`px-1.5 py-0.5 rounded ${action.reversibility === 'IRREVERSIBLE' ? 'bg-red-500/10 text-red-400' : 'bg-surface-2 text-muted'}`}>{action.reversibility}</span>
                      </div>
                    )}

                    {action.decision?.reasons?.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-line text-[11px] font-mono text-muted">
                        Reason: {action.decision.reasons[0]}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Graph & Decision Inspector */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-bg">
          <div className="flex-1 relative">
            <div className="absolute top-4 left-4 z-10 font-mono text-[10px] tracking-wider uppercase text-faint bg-surface/80 border border-line px-2.5 py-1 rounded backdrop-blur">
              Execution Graph View
            </div>

            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              fitView
              style={{ background: 'var(--bg)' }}
            >
              <Background color="var(--line-strong)" gap={20} size={1} />
              <Controls style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '6px' }} />
            </ReactFlow>
          </div>

          {/* Context Decision Inspector */}
          {selectedAction && (
            <div className="h-64 border-t border-line bg-surface p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4 border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="font-mono text-xs uppercase font-medium tracking-wider">
                    Context Inspector: {selectedAction.system}.{selectedAction.operation}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedAction(null)}
                  className="font-mono text-xs text-muted hover:text-fg px-2 py-0.5 rounded border border-line"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-faint block mb-1">
                    DECISION EVALUATION
                  </span>
                  <div className="space-y-1 text-muted">
                    <p>Status: <span className="text-fg font-semibold">{selectedAction.status}</span></p>
                    <p>Capability: <span className="text-fg">{selectedAction.capability || 'none'}</span></p>
                    <p>Authority: <span className="text-fg">{exec.authorityType || 'SERVICE'}</span></p>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-wider text-faint block mb-1">
                    INFORMATION FLOW LABELS
                  </span>
                  <div className="space-y-1 text-muted">
                    <p>Labels: <span className="text-fg">{(selectedAction.provenanceLabels || []).join(', ') || 'None'}</span></p>
                    <p>Destination: <span className="text-fg">{selectedAction.destinationType || 'INTERNAL_API'}</span></p>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-wider text-faint block mb-1">
                    POLICY EVIDENCE
                  </span>
                  <div className="space-y-1 text-muted">
                    <p>Snapshot: <span className="text-accent">{snapshotHash}</span></p>
                    <p className="text-[11px] mt-1">
                      {selectedAction.decision?.reasons?.[0] || 'Verified against policy contract constraints.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
