import React, { useState, useEffect } from 'react';
import { Shield, FileText, Clock, ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  LoadingState,
  Modal,
  Button,
  Input,
} from '../../components/ui';

export default function Policies() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [blockFilesystem, setBlockFilesystem] = useState(true);
  const [requireRepoApproval, setRequireRepoApproval] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchPolicies = () => {
    api
      .getPolicies()
      .then((d) => {
        setPolicies(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    const forbiddenCapabilities = blockFilesystem ? ['fs.write_file'] : [];
    const boundApprovalCapabilities = requireRepoApproval ? ['repository.write', 'external_network.write'] : [];

    try {
      await api.createPolicy({
        name: name.trim(),
        description: description.trim() || undefined,
        priority: 100,
        forbiddenCapabilities,
        boundApprovalCapabilities,
      });
      setName('');
      setDescription('');
      setModalOpen(false);
      fetchPolicies();
    } catch (err) {
      console.error(err);
      alert('Failed to create policy');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Runtime Policies"
        subtitle="Deterministic information-flow control, structural No-Go trajectories, and bound approval policies."
        icon={Shield}
        actions={
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Create Policy
          </Button>
        }
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Security Policy">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Policy Name"
            placeholder="e.g. Strict Egress Boundary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
              Description
            </label>
            <textarea
              className="w-full bg-bg border border-line rounded-lg p-2.5 text-xs text-fg font-sans focus:outline-none focus:border-line-strong transition-colors resize-none h-20"
              placeholder="What this policy restricts or requires..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-line">
            <p className="text-xs font-mono text-muted uppercase">Guardrail Presets</p>
            <label className="flex items-center gap-2.5 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={blockFilesystem}
                onChange={(e) => setBlockFilesystem(e.target.checked)}
                className="rounded border-line"
              />
              <span className="text-fg">Hard-block filesystem modification (<code className="font-mono text-block">fs.write_file</code>)</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requireRepoApproval}
                onChange={(e) => setRequireRepoApproval(e.target.checked)}
                className="rounded border-line"
              />
              <span className="text-fg">Require human approval on external writes (<code className="font-mono text-ask">repository.write</code>)</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || submitting}>
              {submitting ? 'Creating...' : 'Create Policy'}
            </Button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <LoadingState message="Loading registered runtime policies..." className="py-20" />
      ) : policies.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No policies published yet."
          description="Create the first policy to establish an immutable runtime boundary for your autonomous agents."
          actionText="Create Policy"
          onAction={() => setModalOpen(true)}
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
