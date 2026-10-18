export default function ConceptsDoc() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-3">Core Concepts</h1>
      <p className="text-base text-muted leading-relaxed">
        HEED relies on abstract, universal models to evaluate intent across arbitrary external systems.
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-white mt-8 mb-3">The Universal Action</h2>
      <p>HEED decouples <em>what the agent wants to do</em> from <em>how it is executed</em>. An Action contains:</p>
      <ul>
        <li><strong>System:</strong> Where is the action going?</li>
        <li><strong>Operation:</strong> What is it doing?</li>
        <li><strong>Resource:</strong> What data is it touching?</li>
        <li><strong>Capability:</strong> What abstract privilege does this require?</li>
      </ul>

      <h2 className="text-xl font-semibold tracking-tight text-white mt-8 mb-3">Execution Contract</h2>
      <p>A declarative boundary defining what an agent is permitted to do during a specific run. It includes:</p>
      <ul>
        <li><code>objective</code>: The semantic goal of the run.</li>
        <li><code>allowedSystems</code>: Permitted external boundaries.</li>
        <li><code>allowedCapabilities</code>: The maximum privilege level.</li>
        <li><code>restrictedResources</code>: Highly sensitive strings that automatically trigger blocks if touched.</li>
      </ul>

      <h2 className="text-xl font-semibold tracking-tight text-white mt-8 mb-3">Trajectory Evaluation</h2>
      <p>Actions are not evaluated in isolation. The <code>DecisionEngine</code> evaluates the current action against the historical sequence of previously <code>ALLOWED</code> actions, detecting behavioral deviation and capability escalation over time.</p>

      <h2 className="text-xl font-semibold tracking-tight text-white mt-8 mb-3">The Decision Triad</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose mt-6 mb-8">
        <div className="border border-emerald-500/20 bg-emerald-500/10 rounded p-4">
          <h4 className="font-bold text-emerald-400 mb-1">ALLOW</h4>
          <p className="text-sm text-emerald-200">Action is safe, within contract, and logically follows the trajectory. Handed off to Connector.</p>
        </div>
        <div className="border border-amber-500/20 bg-amber-500/10 rounded p-4">
          <h4 className="font-bold text-amber-400 mb-1">ASK</h4>
          <p className="text-sm text-amber-200">Action is highly privileged but permitted. Node execution pauses pending human REST approval.</p>
        </div>
        <div className="border border-rose-500/20 bg-rose-500/10 rounded p-4">
          <h4 className="font-bold text-rose-400 mb-1">BLOCK</h4>
          <p className="text-sm text-rose-200">Action violates contract or touches restricted resource. Immediately trapped and discarded.</p>
        </div>
      </div>
    </div>
  );
}
