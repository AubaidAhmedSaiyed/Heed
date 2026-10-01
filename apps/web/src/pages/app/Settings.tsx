import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Database, Key, Check } from 'lucide-react';
import { PageHeader, Panel, Input, Select, Button } from '../../components/ui';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [retentionDays, setRetentionDays] = useState('30');
  const [evaluationMode, setEvaluationMode] = useState('ENFORCE');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-8">
      <PageHeader
        title="Control Plane Settings"
        subtitle="Manage runtime gateway posture, deterministic enforcement policies, and database retention."
        icon={SettingsIcon}
        actions={
          <Button variant="solid" size="sm" onClick={handleSave} className="gap-1.5">
            {saved ? <Check className="w-3.5 h-3.5" /> : null}
            {saved ? 'Saved' : 'Save Changes'}
          </Button>
        }
      />

      {/* Gateway Enforcement */}
      <Panel
        title="Gateway Enforcement Posture"
        subtitle="Runtime evaluation behavior for intercepted actions"
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-line">
            <div>
              <p className="font-medium text-sm text-fg">Fail-Closed Safety Mode</p>
              <p className="text-xs text-muted font-sans mt-0.5">
                Automatically deny and halt tool side-effects if execution contracts or trajectory cannot be safely resolved.
              </p>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-block-muted text-block border border-block/30 font-semibold uppercase">
              ALWAYS_ACTIVE
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-line">
            <div>
              <p className="font-medium text-sm text-fg">Default Evaluation Mode</p>
              <p className="text-xs text-muted font-sans mt-0.5">
                ENFORCE halts violating actions. OBSERVE logs violations without intercepting tool execution.
              </p>
            </div>
            <div className="w-48">
              <Select
                value={evaluationMode}
                onChange={(e) => setEvaluationMode(e.target.value)}
                options={[
                  { value: 'ENFORCE', label: 'ENFORCE (Default)' },
                  { value: 'OBSERVE', label: 'OBSERVE (Audit Only)' },
                ]}
              />
            </div>
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

      {/* Data Retention */}
      <Panel
        title="Event Storage & Data Retention"
        subtitle="Storage policies for immutable PostgreSQL logs"
      >
        <div className="space-y-4">
          <div className="max-w-xs">
            <Select
              label="Event Retention Period"
              value={retentionDays}
              onChange={(e) => setRetentionDays(e.target.value)}
              options={[
                { value: '14', label: '14 Days' },
                { value: '30', label: '30 Days (Standard)' },
                { value: '90', label: '90 Days' },
                { value: '365', label: '1 Year' },
              ]}
              helperText="Expired action trajectories and cryptographic approval proofs are safely pruned."
            />
          </div>
        </div>
      </Panel>
    </div>
  );
}
