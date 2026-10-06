import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Database, Key, Check, Plus, Trash2 } from 'lucide-react';
import { PageHeader, Panel, Input, Button } from '../../components/ui';
import { api } from '../../lib/api';

export default function Settings() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  React.useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const keys = await api.getApiKeys();
      setApiKeys(keys);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName) return;
    try {
      const key = await api.createApiKey({ name: newKeyName });
      setCreatedKey(key.key);
      setNewKeyName('');
      fetchKeys();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await api.revokeApiKey(id);
      fetchKeys();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-8">
      <PageHeader
        title="Workspace Settings"
        subtitle="Manage runtime API keys and view workspace posture."
        icon={SettingsIcon}
      />

      {/* API Keys */}
      <Panel
        title="Runtime API Keys"
        subtitle="Manage keys used by agents to authenticate with the HEED runtime."
      >
        <div className="space-y-6">
          {createdKey && (
            <div className="p-4 bg-surface-2 border border-allow/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-allow">API Key Created Successfully</p>
                <span className="text-xs text-muted">Keep this secret safe</span>
              </div>
              <p className="text-xs text-muted mb-3">Copy this key now. For security purposes, HEED will never display it again.</p>
              <div className="flex items-center gap-2">
                <div className="bg-bg p-3 border border-line rounded font-mono text-sm break-all flex-1 select-all">
                  {createdKey}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(createdKey);
                    alert("Copied to clipboard!");
                  }}
                >
                  Copy
                </Button>
              </div>
              <Button size="sm" className="mt-3" onClick={() => setCreatedKey(null)}>Done</Button>
            </div>
          )}
          
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                label="New Key Name"
                placeholder="e.g. Production Agent Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateKey} disabled={!newKeyName} className="mb-[2px] gap-2">
              <Plus className="w-4 h-4" /> Create Key
            </Button>
          </div>

          <div className="border border-line rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-surface-2/40 font-mono text-[10px] uppercase text-faint border-b border-line">
                  <th className="px-4 py-3 font-normal">Name</th>
                  <th className="px-4 py-3 font-normal">Key Prefix</th>
                  <th className="px-4 py-3 font-normal">Created</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  <th className="px-4 py-3 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-muted font-mono">No API keys found.</td></tr>
                ) : (
                  apiKeys.map(key => (
                    <tr key={key.id} className="border-b border-line last:border-0 hover:bg-surface-2/40">
                      <td className="px-4 py-3 font-medium text-fg">{key.name}</td>
                      <td className="px-4 py-3 font-mono text-muted">{key.prefix || (key.keyHash ? key.keyHash.substring(0, 12) + "..." : "heed_live_••••")}</td>
                      <td className="px-4 py-3 text-faint">{new Date(key.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {key.revokedAt ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-block-muted text-block border border-block/20">
                            Revoked
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-allow-muted text-allow border border-allow/20">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!key.revokedAt && (
                          <button
                            title="Revoke Key"
                            onClick={() => handleRevoke(key.id)}
                            className="text-block hover:text-red-400 p-1 rounded hover:bg-red-400/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>

      {/* Gateway Enforcement */}
      <Panel
        title="Gateway Enforcement Posture"
        subtitle="Current immutable runtime evaluation rules"
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-line">
            <div>
              <p className="font-medium text-sm text-fg">Fail-Closed Safety Mode</p>
              <p className="text-xs text-muted font-sans mt-0.5">
                Automatically deny and halt tool side-effects if execution contracts cannot be resolved.
              </p>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-block-muted text-block border border-block/30 font-semibold uppercase">
              ALWAYS_ACTIVE
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3">
            <div>
              <p className="font-medium text-sm text-fg">Audit Hash Chain</p>
              <p className="text-xs text-muted font-sans mt-0.5">
                Enforces cryptographic SHA-256 tamper-evident chaining across all recorded ActionEvents in PostgreSQL.
              </p>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-allow-muted text-allow border border-allow/30 font-semibold uppercase">
              ENABLED
            </span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
