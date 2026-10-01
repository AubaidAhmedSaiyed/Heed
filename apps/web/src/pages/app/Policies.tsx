import React, { useState, useEffect } from 'react';
import { Shield, Plus, FileText, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  LoadingState,
  Button,
  Panel,
} from '../../components/ui';

export default function Policies() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPolicies()
      .then((d) => {
        setPolicies(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Runtime Policies"
        subtitle="Deterministic information-flow control, structural No-Go trajectories, and bound approval policies."
        icon={Shield}
        actions={
          <Button variant="solid" size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Create Policy
          </Button>
        }
      />

      {loading ? (
        <LoadingState message="Loading registered runtime policies..." className="py-20" />
      ) : policies.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No policies published yet."
          description="Create the first policy to establish an immutable runtime boundary for your autonomous agents."
          actionText="Create Policy"
          className="my-12"
        />
      ) : (
        <div className="space-y-4">
          {policies.map((policy) => {
            const activeVersion =
              policy.versions?.find((v: any) => v.status === 'PUBLISHED') || policy;
            const versionNum = activeVersion.version || policy.version || 1;
            const status = activeVersion.status || (activeVersion.active ? 'PUBLISHED' : 'DRAFT');

            return (
              <div
                key={policy.id}
                className="border border-line rounded-xl bg-surface hover:border-line-strong transition-all duration-200 group"
              >
                <Link to={`/app/policies/${policy.id}`} className="block p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg border border-line bg-surface-2 flex items-center justify-center text-muted shrink-0 group-hover:text-accent transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-base text-fg tracking-tight">
                          {policy.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-faint font-mono mt-1">
                          <span>{policy.id}</span>
                          <span>•</span>
                          <span className="text-fg font-semibold">v{versionNum}</span>
                          {activeVersion.updatedAt && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />{' '}
                                {new Date(activeVersion.updatedAt).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={status} />
                      <ArrowRight className="w-4 h-4 text-faint group-hover:text-fg group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>

                  {activeVersion.description && (
                    <p className="mt-4 text-xs text-muted border-t border-line pt-3 font-sans">
                      {activeVersion.description}
                    </p>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
