import React, { useState, useEffect } from 'react';
import { Shield, FileText, Clock, ArrowRight, Plus, Trash2, Edit2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
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

interface CapabilityRuleConfig {
  capability: string;
  label: string;
  group: 'Database' | 'External Network' | 'Filesystem' | 'Repository';
  decision: 'ALLOW' | 'ASK' | 'BLOCK';
}

const DEFAULT_CAPABILITY_CONFIGS: Omit<CapabilityRuleConfig, 'decision'>[] = [
  { capability: 'database.write', label: 'Database Writes & Updates', group: 'Database' },
  { capability: 'database.delete', label: 'Database Deletions & Drop Tables', group: 'Database' },
  { capability: 'database.read', label: 'Database Queries & Reads', group: 'Database' },
  { capability: 'external_network.write', label: 'Outbound HTTP POST / Webhooks', group: 'External Network' },
  { capability: 'external_network.read', label: 'Outbound HTTP GET / Fetch', group: 'External Network' },
  { capability: 'fs.write_file', label: 'Filesystem File Writes & Edits', group: 'Filesystem' },
  { capability: 'file.read', label: 'Filesystem File Reads', group: 'Filesystem' },
  { capability: 'repository.write', label: 'GitHub PR Merge & Push', group: 'Repository' },
  { capability: 'repository.read', label: 'GitHub Repository Reads', group: 'Repository' },
];

export default function Policies() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPolicyId, setEditPolicyId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Capability decisions: map capability string -> 'ALLOW' | 'ASK' | 'BLOCK'
  const [rules, setRules] = useState<Record<string, 'ALLOW' | 'ASK' | 'BLOCK'>>({});
  const [customCapability, setCustomCapability] = useState('');
  const [customDecision, setCustomDecision] = useState<'ALLOW' | 'ASK' | 'BLOCK'>('ASK');
  const [customRules, setCustomRules] = useState<string[]>([]);
  
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

  const resetForm = () => {
    setEditPolicyId(null);
    setName('');
    setDescription('');
    const initial: Record<string, 'ALLOW' | 'ASK' | 'BLOCK'> = {
      'database.write': 'ASK',
      'database.delete': 'BLOCK',
      'database.read': 'ALLOW',
      'external_network.write': 'ASK',
      'external_network.read': 'ALLOW',
      'fs.write_file': 'BLOCK',
      'file.read': 'ALLOW',
      'repository.write': 'ASK',
      'repository.read': 'ALLOW',
    };
    setRules(initial);
    setCustomRules([]);
    setCustomCapability('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (policy: any) => {
    const activeVersion = policy.versions?.find((v: any) => v.status === 'PUBLISHED') || policy.versions?.[0] || policy;
    setEditPolicyId(policy.id);
    setName(policy.name || '');
    setDescription(activeVersion.description || policy.description || '');

    const forbidden: string[] = activeVersion.forbiddenCapabilities || [];
    const boundApproval: string[] = activeVersion.boundApprovalCapabilities || [];

    const newRules: Record<string, 'ALLOW' | 'ASK' | 'BLOCK'> = {};
    const standardCaps = DEFAULT_CAPABILITY_CONFIGS.map(c => c.capability);
    const discoveredCustom: string[] = [];

    // Initialize standards
    for (const item of DEFAULT_CAPABILITY_CONFIGS) {
      if (forbidden.includes(item.capability)) {
        newRules[item.capability] = 'BLOCK';
      } else if (boundApproval.includes(item.capability)) {
        newRules[item.capability] = 'ASK';
      } else {
        newRules[item.capability] = 'ALLOW';
      }
    }

    // Check for custom capabilities
    for (const f of forbidden) {
      if (!standardCaps.includes(f)) {
        newRules[f] = 'BLOCK';
        if (!discoveredCustom.includes(f)) discoveredCustom.push(f);
      }
    }
    for (const a of boundApproval) {
      if (!standardCaps.includes(a)) {
        newRules[a] = 'ASK';
        if (!discoveredCustom.includes(a)) discoveredCustom.push(a);
      }
    }

    setRules(newRules);
    setCustomRules(discoveredCustom);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, policyName: string) => {
    if (!window.confirm(`Are you sure you want to delete policy "${policyName}"?`)) return;
    try {
      await api.deletePolicy(id);
      fetchPolicies();
    } catch (e: any) {
      alert(`Failed to delete policy: ${e.message}`);
    }
  };

  const handleAddCustomRule = () => {
    const cap = customCapability.trim();
    if (!cap) return;
    setCustomRules(prev => prev.includes(cap) ? prev : [...prev, cap]);
    setRules(prev => ({ ...prev, [cap]: customDecision }));
    setCustomCapability('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    const forbiddenCapabilities: string[] = [];
    const boundApprovalCapabilities: string[] = [];

    for (const [cap, decision] of Object.entries(rules)) {
      if (decision === 'BLOCK') {
        forbiddenCapabilities.push(cap);
      } else if (decision === 'ASK') {
        boundApprovalCapabilities.push(cap);
      }
    }

    try {
      if (editPolicyId) {
        await api.updatePolicy(editPolicyId, {
          name: name.trim(),
          description: description.trim() || undefined,
          priority: 100,
          forbiddenCapabilities,
          boundApprovalCapabilities,
        });
      } else {
        await api.createPolicy({
          name: name.trim(),
          description: description.trim() || undefined,
          priority: 100,
          forbiddenCapabilities,
          boundApprovalCapabilities,
        });
      }
      setModalOpen(false);
      resetForm();
      fetchPolicies();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save policy: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Runtime Policies"
        subtitle="Define deterministic boundaries: configure which capabilities are autonomous (ALLOW), require human approval (ASK), or are strictly forbidden (BLOCK)."
        icon={Shield}
        actions={
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Create Policy
          </Button>
        }
      />

      {/* Modal Editor */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editPolicyId ? "Edit Runtime Security Policy" : "Create Runtime Security Policy"}
      >
        <form onSubmit={handleSave} className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
          <Input
            label="Policy Name"
            placeholder="e.g. Production Perimeter Governance"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
              Description
            </label>
            <textarea
              className="w-full bg-bg border border-line rounded-lg p-2.5 text-xs text-fg font-sans focus:outline-none focus:border-line-strong transition-colors resize-none h-16"
              placeholder="What this policy restricts and protects..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-4 pt-2 border-t border-line">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-muted uppercase tracking-wider">Capability Governance Matrix</p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-muted">
                <span className="flex items-center gap-1 text-allow"><CheckCircle2 className="w-3 h-3" /> ALLOW</span>
                <span className="flex items-center gap-1 text-ask"><AlertTriangle className="w-3 h-3" /> ASK</span>
                <span className="flex items-center gap-1 text-block"><XCircle className="w-3 h-3" /> BLOCK</span>
              </div>
            </div>

            {/* Standard Capabilities */}
            <div className="space-y-2.5">
              {DEFAULT_CAPABILITY_CONFIGS.map((item) => {
                const currentDecision = rules[item.capability] || 'ALLOW';
                return (
                  <div 
                    key={item.capability}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg border border-line bg-surface/50 text-xs"
                  >
                    <div>
                      <div className="font-medium text-fg">{item.label}</div>
                      <code className="text-[10px] font-mono text-muted">{item.capability}</code>
                    </div>

                    <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-md border border-line self-start sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => setRules(prev => ({ ...prev, [item.capability]: 'ALLOW' }))}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                          currentDecision === 'ALLOW' 
                            ? 'bg-allow/20 text-allow border border-allow/30 shadow-sm' 
                            : 'text-muted hover:text-fg'
                        }`}
                      >
                        ALLOW
                      </button>
                      <button
                        type="button"
                        onClick={() => setRules(prev => ({ ...prev, [item.capability]: 'ASK' }))}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                          currentDecision === 'ASK' 
                            ? 'bg-ask/20 text-ask border border-ask/30 shadow-sm' 
                            : 'text-muted hover:text-fg'
                        }`}
                      >
                        ASK
                      </button>
                      <button
                        type="button"
                        onClick={() => setRules(prev => ({ ...prev, [item.capability]: 'BLOCK' }))}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                          currentDecision === 'BLOCK' 
                            ? 'bg-block/20 text-block border border-block/30 shadow-sm' 
                            : 'text-muted hover:text-fg'
                        }`}
                      >
                        BLOCK
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Rules */}
            {customRules.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] font-mono text-muted uppercase mb-2">Custom Capability Rules</p>
                <div className="space-y-2">
                  {customRules.map((cap) => {
                    const currentDecision = rules[cap] || 'ASK';
                    return (
                      <div key={cap} className="flex items-center justify-between p-2 rounded border border-line bg-surface/30 text-xs">
                        <code className="font-mono text-accent">{cap}</code>
                        <div className="flex items-center gap-2">
                          <select 
                            value={currentDecision}
                            onChange={(e) => setRules(prev => ({ ...prev, [cap]: e.target.value as any }))}
                            className="bg-bg border border-line rounded px-2 py-0.5 text-xs font-mono text-fg"
                          >
                            <option value="ALLOW">ALLOW</option>
                            <option value="ASK">ASK</option>
                            <option value="BLOCK">BLOCK</option>
                          </select>
                          <button 
                            type="button"
                            onClick={() => {
                              setCustomRules(prev => prev.filter(c => c !== cap));
                              setRules(prev => {
                                const next = { ...prev };
                                delete next[cap];
                                return next;
                              });
                            }}
                            className="text-muted hover:text-block transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add Custom Capability */}
            <div className="pt-2 border-t border-line/60">
              <label className="block text-[11px] font-mono text-muted mb-1">Add Custom Capability (e.g. stripe.charge, email.send, *.write)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="capability.name"
                  value={customCapability}
                  onChange={(e) => setCustomCapability(e.target.value)}
                  className="flex-1 bg-bg border border-line rounded px-2.5 py-1.5 text-xs font-mono text-fg focus:outline-none focus:border-line-strong"
                />
                <select
                  value={customDecision}
                  onChange={(e) => setCustomDecision(e.target.value as any)}
                  className="bg-bg border border-line rounded px-2 py-1.5 text-xs font-mono text-fg"
                >
                  <option value="ALLOW">ALLOW</option>
                  <option value="ASK">ASK</option>
                  <option value="BLOCK">BLOCK</option>
                </select>
                <Button variant="outline" size="sm" type="button" onClick={handleAddCustomRule}>
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-line">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || submitting}>
              {submitting ? 'Saving Policy...' : editPolicyId ? 'Update Policy' : 'Create Policy'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Policies List */}
      {loading ? (
        <LoadingState message="Loading registered runtime policies..." className="py-20" />
      ) : policies.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No policies published yet."
          description="Create your first policy to establish an immutable runtime boundary for your autonomous agents."
          actionText="Create Policy"
          onAction={handleOpenCreate}
          className="my-12"
        />
      ) : (
        <div className="space-y-4">
          {policies.map((policy) => {
            const activeVersion =
              policy.versions?.find((v: any) => v.status === 'PUBLISHED') || policy.versions?.[0] || policy;
            const versionNum = activeVersion.version || policy.version || 1;
            const status = activeVersion.status || (activeVersion.active ? 'PUBLISHED' : 'DRAFT');

            const forbidden = activeVersion.forbiddenCapabilities || [];
            const boundApproval = activeVersion.boundApprovalCapabilities || [];

            return (
              <div
                key={policy.id}
                className="border border-line rounded-xl bg-surface hover:border-line-strong transition-all duration-200"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg border border-line bg-surface-2 flex items-center justify-center text-muted shrink-0">
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-base text-fg tracking-tight">
                            {policy.name}
                          </h3>
                          <StatusBadge status={status} />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted font-mono mt-1">
                          <span>ID: {policy.id}</span>
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

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(policy)} 
                        className="gap-1.5 h-8 text-xs font-mono"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(policy.id, policy.name)} 
                        className="h-8 text-xs text-muted hover:text-block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <Link to={`/app/policies/${policy.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {activeVersion.description && (
                    <p className="mt-3 text-xs text-muted font-sans">
                      {activeVersion.description}
                    </p>
                  )}

                  {/* Active Policy Rules Badges */}
                  <div className="mt-4 pt-3 border-t border-line flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono text-muted mr-1">Enforced Rules:</span>
                    
                    {forbidden.length > 0 && forbidden.map((cap: string) => (
                      <span key={cap} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-block/15 text-block border border-block/25">
                        <XCircle className="w-2.5 h-2.5" /> BLOCK: {cap}
                      </span>
                    ))}

                    {boundApproval.length > 0 && boundApproval.map((cap: string) => (
                      <span key={cap} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-ask/15 text-ask border border-ask/25">
                        <AlertTriangle className="w-2.5 h-2.5" /> ASK: {cap}
                      </span>
                    ))}

                    {forbidden.length === 0 && boundApproval.length === 0 && (
                      <span className="text-[11px] font-mono text-faint italic">No custom restrictions (Permissive baseline)</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
