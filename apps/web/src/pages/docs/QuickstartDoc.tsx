import React from 'react';
import { Link } from 'react-router-dom';

export default function QuickstartDoc() {
  return (
    <div className="space-y-8 text-fg">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Quickstart Guide</h1>
        <p className="text-base text-muted leading-relaxed">
          Get started with HEED in under two minutes. Learn how to authenticate, install the runtime SDK, and place deterministic guardrails on your autonomous agents.
        </p>
      </div>

      <div className="p-4 rounded-xl border border-line bg-surface-2/30 text-xs text-muted flex items-center justify-between">
        <span>Need credentials first?</span>
        <div className="flex gap-2">
          <Link to="/auth/signup" className="text-accent font-semibold hover:underline">Create Free Account &rarr;</Link>
          <span className="text-line">|</span>
          <Link to="/app/settings" className="text-accent font-semibold hover:underline">Get API Key &rarr;</Link>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">1. Create an API Key</h2>
        <p className="text-sm text-muted">
          Log in to your HEED dashboard, navigate to <Link to="/app/settings" className="text-accent underline">Workspace Settings</Link>, and click <strong>Create Key</strong>. Store the generated key securely in your environment variables.
        </p>
        <div className="bg-bg border border-line rounded-lg p-4 font-mono text-xs text-muted overflow-x-auto">
          HEED_API_KEY="heed_live_xxxxxxxxxxxxxxxxxxxxxxxx"
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">2. Install the Runtime SDK</h2>
        <p className="text-sm text-muted">
          Install the lightweight, zero-dependency HEED runtime client into your TypeScript or Node.js agent project:
        </p>
        <div className="bg-bg border border-line rounded-lg p-4 font-mono text-xs text-fg flex items-center justify-between">
          <code>npm install @heed-ai/runtime</code>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">3. Protect an Agent Tool Action</h2>
        <p className="text-sm text-muted">
          Wrap your agent's consequential tools using <code className="font-mono bg-surface-2 px-1.5 py-0.5 rounded text-fg">heed.execute()</code>. HEED evaluates the action against active workspace policies before the underlying tool can run:
        </p>
        <div className="bg-bg border border-line rounded-lg p-4 font-mono text-xs text-fg overflow-x-auto">
          <pre>{`import { Heed, HeedError } from "@heed-ai/runtime";

// Automatically picks up HEED_API_KEY and HEED_RUNTIME_URL from process.env
const heed = new Heed({
  apiKey: process.env.HEED_API_KEY,
  agentId: "customer-support-agent"
});

async function runGovernedAgent() {
  try {
    // 1. Benign Read: Passes policy evaluation (ALLOW)
    console.log("Executing safe action...");
    const readResult = await heed.execute({
      system: "fs-sim",
      operation: "read_file",
      resource: "data/knowledge_base.md",
      capability: "file.read",
      arguments: { path: "data/knowledge_base.md" }
    });
    console.log("Success:", readResult);

    // 2. Destructive Write: Intercepted and rejected (BLOCK)
    console.log("Attempting unauthorized write...");
    await heed.execute({
      system: "fs-sim",
      operation: "write_file",
      resource: "/etc/hosts",
      capability: "fs.write_file",
      arguments: { path: "/etc/hosts", content: "127.0.0.1 badsite.com" }
    });
  } catch (error) {
    if (error instanceof HeedError) {
      console.warn("🛡️ Action Blocked by HEED Runtime Gate!");
      console.warn("Decision:", error.decision); // "BLOCK" | "ASK"
      console.warn("Reasons:", error.reasons);
    } else {
      console.error("Execution failed:", error);
    }
  }
}

runGovernedAgent();`}</pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">4. Human Approval (ASK Flow)</h2>
        <p className="text-sm text-muted">
          When an agent requests a sensitive capability requiring human sign-off (such as <code className="font-mono bg-surface-2 px-1.5 py-0.5 rounded text-fg">repository.write</code> or financial transfers), HEED halts the tool and returns <code className="font-mono text-ask">BOUND_APPROVAL</code>.
        </p>
        <p className="text-sm text-muted">
          The intervention instantly surfaces in your <Link to="/app/approvals" className="text-accent underline">Approvals Dashboard</Link> where operators can review the payload, reason, and provenance before approving or denying.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">5. Live Verification</h2>
        <p className="text-sm text-muted">
          Visit your <Link to="/app" className="text-accent underline">Runtime Overview</Link> to inspect real-time execution graphs, immutable SHA-256 audit logs, and provenance telemetry.
        </p>
      </section>
    </div>
  );
}
