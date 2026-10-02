export default function SDKDoc() {
  return (
    <div>
      <h1>SDK Reference</h1>
      <p className="lead">
        The <code>@heed-ai/runtime</code> SDK provides a single, minimal abstraction layer for agent developers to wrap consequential actions.
      </p>

      <h2>Initialization</h2>
      <pre><code>import {'{'} Heed {'}'} from "@heed-ai/runtime";{'\n\n'}const heed = new Heed({'{'}{'\n'}  runtimeUrl: "http://localhost:4000",{'\n'}  agentId: "my-custom-agent",{'\n'}  executionId: "exec-123", // Provided by your execution context{'\n'}  apiKey: "dev-key"{'\n'}{'}'});</code></pre>

      <h2>heed.execute()</h2>
      <p>Wraps an intended action. Throws a <code>HeedError</code> if the trajectory is blocked.</p>
      
      <pre><code>try {'{'}{'\n'}  const result = await heed.execute({'{'}{'\n'}    system: "github", // Target external system{'\n'}    operation: "read_pull_request",{'\n'}    resource: "facebook/react/pull/10000", // Standardized target{'\n'}    capability: "repository.read", // The abstract capability{'\n'}    arguments: {'{'} owner: "facebook", repo: "react", pull_number: 10000 {'}'}{'\n'}  {'}'});{'\n'}{'}'} catch (error) {'{'}{'\n'}  // Handle rejection{'\n'}{'}'}</code></pre>

      <h3>Action Fields</h3>
      <ul>
        <li><strong>system</strong> <code>string</code>: The external boundary being crossed (e.g., <code>github</code>, <code>http</code>, <code>slack</code>). Maps to the backend Connector.</li>
        <li><strong>operation</strong> <code>string</code>: The specific action (e.g., <code>post_review</code>).</li>
        <li><strong>resource</strong> <code>string</code>: The localized target string. Evaluated for sensitivity.</li>
        <li><strong>capability</strong> <code>string</code>: The abstracted privilege required (e.g., <code>communication.write</code>, <code>file.read</code>). Evaluated against the Contract.</li>
        <li><strong>arguments</strong> <code>Record&lt;string, any&gt;</code>: The raw payload passed to the Connector. Automatically redacted before storage.</li>
      </ul>

      <h2>HeedError</h2>
      <p>If HEED intercepts and stops an action, it throws a structured error.</p>
      <pre><code>import {'{'} HeedError {'}'} from "@heed-ai/runtime";{'\n\n'}if (error instanceof HeedError) {'{'}{'\n'}  console.log(error.decision); // "BLOCK" | "TERMINATED"{'\n'}  console.log(error.reasons); // Array of string reasons explaining the rejection{'\n'}{'}'}</code></pre>
    </div>
  );
}
