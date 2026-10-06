import React from 'react';

export default function SDKDoc() {
  return (
    <div className="space-y-8 text-fg">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">SDK Reference</h1>
        <p className="text-base text-muted leading-relaxed">
          The <code className="font-mono text-sm bg-surface-2 px-1.5 py-0.5 rounded text-fg">@heed-ai/runtime</code> SDK provides a single, high-performance abstraction for agent developers to place runtime governance, information-flow tracking, and approval gates around autonomous tool calls.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Installation</h2>
        <div className="bg-bg border border-line rounded-lg p-4 font-mono text-xs text-fg">
          npm install @heed-ai/runtime
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Initialization</h2>
        <p className="text-sm text-muted">
          Initialize a new client. All parameters are optional if standard environment variables (<code className="font-mono text-fg">HEED_API_KEY</code>, <code className="font-mono text-fg">HEED_RUNTIME_URL</code>) are defined.
        </p>
        <div className="bg-bg border border-line rounded-lg p-4 font-mono text-xs text-fg overflow-x-auto">
          <pre>{`import { Heed } from "@heed-ai/runtime";

const heed = new Heed({
  apiKey: "heed_live_...",                    // Defaults to process.env.HEED_API_KEY
  runtimeUrl: "https://api.heed.dev",        // Defaults to process.env.HEED_RUNTIME_URL or http://localhost:4000
  agentId: "support-agent-v2",               // Identifier for the autonomous agent
  executionId?: "exec-12345"                 // Optional: attach to existing execution session
});`}</pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Methods</h2>

        <div className="space-y-6">
          <div className="border border-line rounded-xl p-5 bg-surface">
            <h3 className="font-mono text-sm font-semibold text-accent mb-2">heed.execute(action)</h3>
            <p className="text-xs text-muted mb-4">
              Sends an intended tool action to the HEED gateway for policy and contract evaluation. Returns the action result if allowed; throws a <code className="font-mono text-fg">HeedError</code> if blocked or awaiting approval.
            </p>
            <div className="bg-bg border border-line rounded-lg p-4 font-mono text-xs text-fg overflow-x-auto">
              <pre>{`const result = await heed.execute({
  system: "github",                        // Target connector system (e.g. "github", "http", "fs-sim")
  operation: "create_comment",             // Operation to execute
  resource: "owner/repo/pull/42",          // Identifier of target resource
  capability: "repository.write",          // Abstract privilege checked by policy
  arguments: { body: "LGTM!" }             // Payload passed to connector (sanitized before storage)
});`}</pre>
            </div>
          </div>

          <div className="border border-line rounded-xl p-5 bg-surface">
            <h3 className="font-mono text-sm font-semibold text-accent mb-2">heed.wrapTool(toolFn, metadata)</h3>
            <p className="text-xs text-muted mb-4">
              Higher-order helper that wraps any existing TypeScript or JavaScript function with automated HEED pre-execution checks.
            </p>
            <div className="bg-bg border border-line rounded-lg p-4 font-mono text-xs text-fg overflow-x-auto">
              <pre>{`const governedWrite = heed.wrapTool(
  async (filePath: string, content: string) => {
    return fs.promises.writeFile(filePath, content, "utf8");
  },
  {
    system: "fs-sim",
    operation: "write_file",
    resource: "data/config.json",
    capability: "fs.write_file"
  }
);

// If blocked by policy, the underlying writeFile function will NEVER execute:
await governedWrite("data/config.json", "{ \\"key\\": \\"value\\" }");`}</pre>
            </div>
          </div>

          <div className="border border-line rounded-xl p-5 bg-surface">
            <h3 className="font-mono text-sm font-semibold text-accent mb-2">heed.createExecution(objective, contract?, authority?)</h3>
            <p className="text-xs text-muted mb-4">
              Explicitly declares an execution envelope with custom boundary constraints and human authority context before executing multi-step workflows.
            </p>
            <div className="bg-bg border border-line rounded-lg p-4 font-mono text-xs text-fg overflow-x-auto">
              <pre>{`const executionId = await heed.createExecution("Analyze Security PR", {
  objective: "Review code changes for security vulnerabilities",
  allowedSystems: ["github"],
  allowedCapabilities: ["repository.read"],
  forbiddenCapabilities: ["repository.write", "fs.write_file"]
});`}</pre>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Error Handling: HeedError</h2>
        <p className="text-sm text-muted">
          When an action violates an active policy or requires human sign-off, HEED throws a structured <code className="font-mono text-fg">HeedError</code>:
        </p>
        <div className="bg-bg border border-line rounded-lg p-4 font-mono text-xs text-fg overflow-x-auto">
          <pre>{`import { HeedError } from "@heed-ai/runtime";

try {
  await heed.execute({ ... });
} catch (error) {
  if (error instanceof HeedError) {
    console.log(error.decision); // "BLOCK" | "ASK" | "BOUND_APPROVAL" | "UNAUTHORIZED"
    console.log(error.reasons);  // Array of policy violation messages
    console.log(error.message);  // Formatted human-readable explanation
  }
}`}</pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Information-Flow Control (Provenance)</h2>
        <p className="text-sm text-muted">
          Attach confidentiality or sensitivity labels to data flowing through your agent. HEED deterministically prevents tainted data from reaching untrusted external sinks:
        </p>
        <div className="bg-bg border border-line rounded-lg p-4 font-mono text-xs text-fg overflow-x-auto">
          <pre>{`// Tag the current execution with confidential credentials:
heed.provenance.mark(["credentials", "confidential"], "github-auth-token");

// Outbound actions automatically inherit these labels. If policy forbids
// leaking credentials to external networks, HEED blocks the request.`}</pre>
        </div>
      </section>
    </div>
  );
}
