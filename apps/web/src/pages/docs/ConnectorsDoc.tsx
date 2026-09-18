export default function ConnectorsDoc() {
  return (
    <div>
      <h1>Connectors</h1>
      <p className="lead">
        HEED routes <code>ALLOWED</code> actions to external systems using pluggable Connectors. The MVP includes two verified implementations.
      </p>

      <h2>GitHub Connector</h2>
      <p>A structured connector wrapping the Octokit API. It proves HEED's ability to interpret complex agent intent against source control repositories.</p>
      <ul>
        <li><strong>Status:</strong> Implemented</li>
        <li><strong>Configuration:</strong> <code>GITHUB_TOKEN</code> environment variable.</li>
        <li><strong>Capabilities:</strong> <code>repository.read</code>, <code>pull_request.read</code>, <code>review.write</code></li>
      </ul>

      <h2>HTTP Connector</h2>
      <p>A universal webhook and REST connector using native <code>fetch</code>. Proves HEED's engine is fundamentally agnostic to the underlying system boundary.</p>
      <ul>
        <li><strong>Status:</strong> Implemented</li>
        <li><strong>Configuration:</strong> Generic URL targets in action payload.</li>
        <li><strong>Capabilities:</strong> <code>external_network.read</code>, <code>external_network.write</code></li>
      </ul>

      <h2>Future Connectors</h2>
      <p>Because the HEED evaluation engine relies exclusively on abstract properties (Capability, Resource Sensitivity, Contract bounds), introducing a new connector (e.g., Slack, Linear, Postgres) requires zero changes to the underlying security logic.</p>
    </div>
  );
}
