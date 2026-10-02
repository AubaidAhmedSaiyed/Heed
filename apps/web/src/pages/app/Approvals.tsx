import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Lock, Shield, Hash } from 'lucide-react';
import { api } from '../../lib/api';
import {
  PageHeader,
  StatusBadge,
  Tabs,
  EmptyState,
  LoadingState,
  Button,
  Card,
  Panel,
} from '../../components/ui';

export default function Approvals() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'RESOLVED'>('PENDING');

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = () => {
    setLoading(true);
    api
      .getApprovals()
      .then((d) => {
        setApprovals(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleResolve = async (id: string, decision: string) => {
    await api.resolveApproval(id, decision);
    fetchApprovals();
  };

  const pending = approvals.filter((a) => a.status === 'PENDING');
  const resolved = approvals.filter((a) => a.status !== 'PENDING');
  const displayList = filter === 'PENDING' ? pending : resolved;

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto w-full">
      <PageHeader
        title="Human Interventions & Bound Approvals"
        subtitle="Cryptographically bound interventions for sensitive agent actions. Approval is anchored to exact arguments, provenance, destination, and policy snapshot."
        icon={CheckCircle}
      />

      <Tabs
        tabs={[
          { id: 'PENDING', label: 'Pending Intervention', count: pending.length },
          { id: 'RESOLVED', label: 'Resolved History', count: resolved.length },
        ]}
        activeTab={filter}
        onChange={(id) => setFilter(id as any)}
      />

      {loading ? (
        <LoadingState message="Loading approval inbox..." className="py-20" />
      ) : displayList.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Nothing needs your attention."
          description={
            filter === 'PENDING'
              ? 'No pending interventions requiring human oversight. Autonomous boundaries are healthy.'
              : 'No resolved approval history on record.'
          }
          className="my-12"
        />
      ) : (
        <div className="space-y-6">
          {displayList.map((a) => {
            const isPending = a.status === 'PENDING';
            const actionTarget = `${a.actionEvent?.system || 'system'}.${a.actionEvent?.operation || 'operation'}`;

            return (
              <div
                key={a.id}
                className="border border-line rounded-xl bg-surface overflow-hidden transition-all duration-200"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-line bg-surface-2/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface border border-line flex items-center justify-center">
                      <Lock className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs uppercase font-semibold text-fg">
                          Execution {a.executionId ? a.executionId.split('-')[0] : 'Unknown'}
                        </span>
                        <span className="font-mono text-[10px] text-faint">•</span>
                        <span className="font-mono text-xs text-muted">{actionTarget}</span>
                      </div>
                      <p className="font-mono text-[11px] text-faint mt-0.5">
                        Requested: {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={a.status === 'PENDING' ? 'ASK' : a.decision || a.status} />
                </div>

                {/* Body Content */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs">
                  {/* Action Context */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase text-faint tracking-wider block mb-1">
                        TARGET RESOURCE & CAPABILITY
                      </span>
                      <p className="text-fg font-medium truncate">{a.actionEvent?.resource || 'N/A'}</p>
                      <p className="text-muted text-[11px] mt-0.5">
                        Capability: {a.actionEvent?.capability || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-faint tracking-wider block mb-1">
                        EVALUATION INTERVENTION REASON
                      </span>
                      <div className="p-3 rounded-lg border border-ask/25 bg-ask-muted text-ask text-xs">
                        {a.decision?.reasons?.[0] || 'Sensitive operation requires explicit bound approval.'}
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Context Binding */}
                  <div className="border-t md:border-t-0 md:border-l border-line md:pl-8 space-y-3">
                    <div className="flex items-center gap-2 text-fg font-medium mb-1">
                      <Shield className="w-4 h-4 text-accent" />
                      <span>Context Binding Proof</span>
                    </div>
                    <p className="text-muted font-sans text-xs leading-relaxed">
                      Approval is strictly tied to this action context instead of becoming a reusable permission token.
                    </p>

                    <div className="p-3 rounded-lg bg-surface-2/60 border border-line space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-faint">Arguments Hash:</span>
                        <span className="text-muted font-mono">{a.actionEvent?.approval?.argumentsHash || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-faint">Provenance Hash:</span>
                        <span className="text-muted font-mono">{a.actionEvent?.approval?.provenanceHash || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-faint">Destination Hash:</span>
                        <span className="text-muted font-mono">{a.actionEvent?.approval?.destinationHash || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-faint">Policy Snapshot:</span>
                        <span className="text-accent font-mono">{a.actionEvent?.approval?.policySnapshotId || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                {isPending && (
                  <div className="px-6 py-3.5 border-t border-line bg-surface-2/30 flex items-center justify-end gap-3">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleResolve(a.id, 'BLOCK')}
                    >
                      Reject (Block Action)
                    </Button>
                    <Button
                      variant="solid"
                      size="sm"
                      onClick={() => handleResolve(a.id, 'ALLOW_ONCE')}
                    >
                      Approve Bound Action
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
