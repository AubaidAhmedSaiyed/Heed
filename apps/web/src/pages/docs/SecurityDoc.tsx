export default function SecurityDoc() {
  return (
    <div>
      <h1>Security & Data Handling</h1>
      <p className="lead">
        HEED sits directly in the data path of highly privileged autonomous agents. The runtime is designed to minimize risk and data leakage.
      </p>

      <h2>Pre-Execution Enforcement</h2>
      <p>HEED operates in a strictly chronological enforcement model. A <code>BLOCKED</code> action throws a <code>HeedError</code> and mathematically prevents the underlying Connector from ever receiving the payload. No side effects occur.</p>

      <h2>Payload Sanitization</h2>
      <p>The <code>ActionNormalizer</code> runs instantly on every incoming request. It recursively scans the <code>arguments</code> payload for sensitive keys (e.g., <code>password</code>, <code>token</code>, <code>secret</code>) and replaces them with <code>[REDACTED]</code>.</p>

      <h2>Database Minimization</h2>
      <p>The Prisma `ActionEvent` table only stores the <em>metadata</em> of an execution trajectory (the System, Operation, Capability, and Decision). The raw arguments are discarded after connector execution. The Control Plane UI never receives raw payloads.</p>

      <h2>API Authentication</h2>
      <p>The HEED REST API requires a Bearer token (<code>HEED_API_KEY</code>) for all action ingestion endpoints, ensuring arbitrary scripts cannot poison the trajectory baseline.</p>
    </div>
  );
}
