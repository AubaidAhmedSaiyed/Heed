import React from 'react';

export default function APIDoc() {
  return (
    <div className="space-y-8 text-fg">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">REST API Reference</h1>
        <p className="text-base text-muted leading-relaxed">
          HEED provides a robust HTTP REST API. Developers can execute agent actions, manage policy snapshots, and resolve interventions programmatically using standard Bearer API Keys.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Authentication</h2>
        <p className="text-sm text-muted">
          All endpoints accept your HEED API Key passed in the standard HTTP <code className="font-mono text-fg">Authorization</code> header:
        </p>
        <div className="bg-bg border border-line rounded-lg p-4 font-mono text-xs text-fg">
          Authorization: Bearer heed_live_xxxxxxxxxxxxxxxxxxxxxxxx
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight">Endpoints</h2>

        {/* POST /api/executions */}
        <div className="border border-line rounded-xl p-5 bg-surface space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-allow-muted text-allow font-bold">POST</span>
            <code className="font-mono text-sm font-semibold text-fg">/api/executions</code>
          </div>
          <p className="text-xs text-muted">Initialize an execution context under active workspace policy snapshots.</p>
          <div className="bg-bg border border-line rounded-lg p-3 font-mono text-xs text-fg overflow-x-auto">
            <pre>{`curl -X POST https://api.heed.dev/api/executions \\
  -H "Authorization: Bearer heed_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "objective": "Process monthly payroll data",
    "contract": {
      "forbiddenCapabilities": ["fs.write_file"]
    }
  }'`}</pre>
          </div>
          <p className="text-xs text-muted font-mono">Response (200 OK): &#123; "id": "exec-uuid-1234" &#125;</p>
        </div>

        {/* POST /api/executions/:id/actions */}
        <div className="border border-line rounded-xl p-5 bg-surface space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-allow-muted text-allow font-bold">POST</span>
            <code className="font-mono text-sm font-semibold text-fg">/api/executions/:id/actions</code>
          </div>
          <p className="text-xs text-muted">Evaluate and execute an agent tool call against runtime policies.</p>
          <div className="bg-bg border border-line rounded-lg p-3 font-mono text-xs text-fg overflow-x-auto">
            <pre>{`curl -X POST https://api.heed.dev/api/executions/exec-uuid-1234/actions \\
  -H "Authorization: Bearer heed_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "system": "fs-sim",
    "operation": "read_file",
    "resource": "data/sample.json",
    "capability": "file.read",
    "arguments": { "path": "data/sample.json" }
  }'`}</pre>
          </div>
          <p className="text-xs text-muted font-mono">
            Response on Success (200 OK): &#123; "data": &#123; ... &#125; &#125;<br />
            Response on Violation (403 Forbidden): &#123; "error": "Action blocked", "decision": "BLOCK", "reasons": [...] &#125;
          </p>
        </div>

        {/* GET /api/v1/api-keys */}
        <div className="border border-line rounded-xl p-5 bg-surface space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-2 text-muted font-bold">GET</span>
            <code className="font-mono text-sm font-semibold text-fg">/api/v1/api-keys</code>
          </div>
          <p className="text-xs text-muted">List all API keys belonging to the authenticated workspace.</p>
        </div>

        {/* POST /api/v1/api-keys */}
        <div className="border border-line rounded-xl p-5 bg-surface space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-allow-muted text-allow font-bold">POST</span>
            <code className="font-mono text-sm font-semibold text-fg">/api/v1/api-keys</code>
          </div>
          <p className="text-xs text-muted">Generate a new runtime API key. Returns full plaintext secret once.</p>
        </div>

        {/* DELETE /api/v1/api-keys/:id */}
        <div className="border border-line rounded-xl p-5 bg-surface space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-block-muted text-block font-bold">DELETE</span>
            <code className="font-mono text-sm font-semibold text-fg">/api/v1/api-keys/:id</code>
          </div>
          <p className="text-xs text-muted">Immediately revoke an API key. Revoked keys reject with 401 Unauthorized.</p>
        </div>

        {/* GET /api/v1/events */}
        <div className="border border-line rounded-xl p-5 bg-surface space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-2 text-muted font-bold">GET</span>
            <code className="font-mono text-sm font-semibold text-fg">/api/v1/events</code>
          </div>
          <p className="text-xs text-muted">Stream immutable audit events verified by cryptographic SHA-256 hash chains.</p>
        </div>

        {/* POST /api/v1/interventions/:id/resolve */}
        <div className="border border-line rounded-xl p-5 bg-surface space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-allow-muted text-allow font-bold">POST</span>
            <code className="font-mono text-sm font-semibold text-fg">/api/v1/interventions/:id/resolve</code>
          </div>
          <p className="text-xs text-muted">Resolve a pending human approval with <code className="font-mono text-fg">ALLOW_ONCE</code>, <code className="font-mono text-fg">BLOCK</code>, or <code className="font-mono text-fg">TERMINATE_EXECUTION</code>.</p>
        </div>
      </section>
    </div>
  );
}
