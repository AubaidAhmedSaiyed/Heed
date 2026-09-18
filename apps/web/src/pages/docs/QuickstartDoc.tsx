export default function QuickstartDoc() {
  return (
    <div>
      <h1>Quickstart</h1>
      <p className="lead">
        Get HEED running locally to protect your autonomous agent's execution trajectory.
      </p>

      <h2>1. Install Dependencies</h2>
      <p>Clone the repository and install the monorepo packages:</p>
      <pre><code>git clone https://github.com/heed/heed.git{'\n'}cd heed{'\n'}npm install</code></pre>

      <h2>2. Configure Environment</h2>
      <p>Create a <code>.env</code> file in the root directory. This configures the runtime API and provides credentials for the real external connectors.</p>
      <pre><code>HEED_API_KEY="dev-key"{'\n'}DATABASE_URL="postgresql://postgres:password@localhost:5432/heed"{'\n\n'}# Real-World Execution Integration{'\n'}GITHUB_TOKEN="your-github-token"{'\n'}GITHUB_OWNER="facebook"{'\n'}GITHUB_REPO="react"{'\n'}GITHUB_PR_NUMBER="10000"{'\n\n'}# Guardrail Mode (Prevents accidental real writes){'\n'}GITHUB_WRITE_TEST="false"</code></pre>
      <p><em>Note: Your GitHub credentials remain strictly local. HEED redacts secrets before they hit the Prisma event store.</em></p>

      <h2>3. Start the Runtime & Control Plane</h2>
      <p>First, push the execution schema to PostgreSQL:</p>
      <pre><code>npx prisma db push</code></pre>
      
      <p>Start the API server (Port 4000) and the UI (Port 3000):</p>
      <pre><code>npm run api{'\n'}npm run ui</code></pre>

      <h2>4. Run the Verified Agents</h2>
      <p>HEED includes two primary examples to prove the universal architecture.</p>
      
      <h3>The GitHub Agent</h3>
      <pre><code>npm run example -w apps/demo-agent</code></pre>
      <p>This runs a multi-step trajectory: <code>ALLOW (PR)</code> → <code>ALLOW (Diff)</code> → <code>BLOCK (.env read)</code> → <code>ASK (Webhook)</code>.</p>

      <h3>The Generic HTTP Agent</h3>
      <pre><code>npm run example:generic -w apps/demo-agent</code></pre>
      <p>This proves HEED is not GitHub-specific by executing an arbitrary webhook and blocking a fake stripe payment action.</p>

      <h2>5. Observe the Execution</h2>
      <p>Open <a href="/app">the Control Plane</a> in your browser. You will see the agent's real-time trajectory, the contextual decisions, and the exact intervention points where HEED mathematically prevented external side effects.</p>
    </div>
  );
}
