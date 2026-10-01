import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeedFlowBackground } from '../components/ui/HeedFlowBackground';

const LandingPageStyles = `
  .heed-landing {
    background: var(--bg);
    color: var(--fg);
    font-family: var(--sans);
    font-size: 16px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  
  .heed-landing section {
    position: relative;
    padding: 120px 0;
  }
  
  .heed-landing .wrap {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 32px;
  }

  .heed-landing h1, .heed-landing h2, .heed-landing h3 {
    font-weight: 500;
    letter-spacing: -0.03em;
    line-height: 1.05;
  }
  
  .heed-landing h1 { font-size: clamp(48px, 7vw, 96px); }
  .heed-landing h2 { font-size: clamp(36px, 5vw, 64px); }
  
  .heed-landing .eyebrow {
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--faint);
    margin-bottom: 24px;
  }

  .heed-landing .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 14px 28px;
    font-size: 15px;
    font-weight: 500;
    border-radius: 4px;
    transition: all 0.3s var(--ease);
    cursor: pointer;
    text-decoration: none;
  }
  .heed-landing .btn-solid { background: var(--fg); color: var(--bg); }
  .heed-landing .btn-solid:hover { opacity: 0.9; }
  .heed-landing .btn-ghost { border: 1px solid var(--line-strong); color: var(--fg); }
  .heed-landing .btn-ghost:hover { background: var(--surface); }

  /* Hero */
  .hero-visual {
    position: relative;
    width: 100%;
    height: 300px;
    margin-top: 80px;
    background: linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%);
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--line);
  }
  .hero-visual::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
  }
  .hero-flow {
    display: flex;
    align-items: center;
    gap: 40px;
    opacity: 0.8;
  }
  .h-node { font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; color: var(--muted); text-transform: uppercase; }
  .h-line { width: 60px; height: 1px; background: var(--line-strong); position: relative; }
  .h-line::after { content:''; position: absolute; left: 0; top: -1px; width: 0; height: 3px; background: var(--accent); transition: 2s var(--ease); }
  .h-boundary { width: 1px; height: 80px; background: var(--line-strong); }
  .in .h-line::after { width: 100%; }

  /* Interactive Playground */
  .playground {
    margin-top: 64px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--surface);
    display: grid;
    grid-template-columns: 1fr 1fr;
    overflow: hidden;
  }
  .pg-controls { padding: 48px; border-right: 1px solid var(--line); }
  .pg-result { padding: 48px; display: flex; flex-direction: column; justify-content: center; background: var(--surface-elevated); }
  .pg-group { margin-bottom: 32px; }
  .pg-group:last-child { margin-bottom: 0; }
  .pg-label { font-family: var(--mono); font-size: 11px; color: var(--faint); text-transform: uppercase; margin-bottom: 12px; display: block; letter-spacing: 0.05em;}
  .pg-options { display: flex; flex-wrap: wrap; gap: 8px; }
  .pg-opt {
    font-family: var(--mono); font-size: 12px; padding: 6px 12px; border: 1px solid var(--line);
    border-radius: 4px; cursor: pointer; color: var(--muted); transition: 0.2s;
  }
  .pg-opt.active { background: var(--fg); color: var(--bg); border-color: var(--fg); }
  
  .decision-display { text-align: center; }
  .dec-tag { font-family: var(--mono); font-size: 24px; font-weight: 500; letter-spacing: 0.1em; margin-bottom: 16px; display: inline-block;}
  .dec-tag.ALLOW { color: var(--allow); }
  .dec-tag.ASK, .dec-tag.BOUND_APPROVAL { color: var(--ask); }
  .dec-tag.BLOCK, .dec-tag.INVALID { color: var(--block); }
  .dec-reason { color: var(--muted); font-size: 15px; }

  /* Context grid */
  .ctx-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 64px; }
  .ctx-card { padding: 32px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface-elevated); transition: 0.3s; }
  .ctx-card:hover { border-color: var(--line-strong); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); }
  .ctx-card h3 { font-family: var(--mono); font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; color: var(--muted); }
  .ctx-card p { font-size: 15px; color: var(--fg); }

  /* Storytelling Sections */
  .story-row { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; margin-bottom: 120px; }
  .story-row:last-child { margin-bottom: 0; }
  .story-visual { padding: 64px; background: var(--surface); border-radius: 12px; border: 1px solid var(--line); text-align: center; }
  .story-visual code { font-family: var(--mono); font-size: 13px; color: var(--accent); }

  /* Evidence */
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; margin-top: 48px; }
  .stat-item { border-top: 1px solid var(--line); padding-top: 24px; }
  .stat-num { font-size: 64px; font-weight: 400; line-height: 1; margin-bottom: 16px; color: var(--fg); }
  .stat-desc { font-size: 14px; color: var(--muted); }

  /* Code */
  .code-block { background: var(--surface-2); border: 1px solid var(--line); border-radius: 8px; padding: 32px; margin-top: 48px; overflow-x: auto; }
  .code-block pre { font-family: var(--mono); font-size: 13px; color: var(--fg); line-height: 1.7; margin: 0; }
  
  /* Utilities */
  .rv { opacity: 0; transform: translateY(16px); transition: 0.8s var(--ease); }
  .rv.in { opacity: 1; transform: translateY(0); }
  
  @media (max-width: 900px) {
    .heed-landing h1 { font-size: 40px; }
    .heed-landing h2 { font-size: 32px; }
    .story-row, .playground, .ctx-grid { grid-template-columns: 1fr; }
    .pg-controls { border-right: none; border-bottom: 1px solid var(--line); }
    .stat-grid { grid-template-columns: 1fr 1fr; }
    .hero-visual { display: none; }
  }
`;

function Playground() {
  const [prov, setProv] = useState('PII');
  const [dest, setDest] = useState('EXTERNAL_WEBHOOK');
  const [auth, setAuth] = useState('SERVICE');
  const [traj, setTraj] = useState('CLEAN');

  let decision = 'ALLOW';
  let reason = 'Action proceeds to external system.';

  if (prov === 'PII' && dest !== 'INTERNAL_API') {
    decision = 'BLOCK'; reason = 'PII cannot be sent outside internal boundaries without redaction.';
  } else if (prov === 'SECRET' && dest !== 'INTERNAL_API') {
    decision = 'BLOCK'; reason = 'Secrets are strictly prohibited from egress boundaries.';
  } else if (traj === 'CREDENTIAL_READ' && dest !== 'INTERNAL_API') {
    decision = 'BLOCK'; reason = 'Credential read followed by external network write violates No-Go trajectory.';
  } else if (auth === 'USER' && dest === 'EXTERNAL_WEBHOOK') {
    decision = 'ASK'; reason = 'User-initiated external webhooks require human intervention.';
  } else if (traj === 'SENSITIVE_OPERATION') {
    decision = 'BOUND_APPROVAL'; reason = 'Sensitive prior operations require explicit approval binding for egress.';
  } else if (dest === 'SAAS_TOOL' && prov === 'REDACTED') {
    decision = 'ALLOW_CONSTRAINED'; reason = 'Action allowed with forced redaction constraints applied.';
  }

  return (
    <div className="playground rv">
      <div className="pg-controls">
        <div className="pg-group">
          <span className="pg-label">Provenance</span>
          <div className="pg-options">
            {['TRUSTED', 'PII', 'SECRET', 'REDACTED'].map(v => (
              <div key={v} onClick={() => setProv(v)} className={`pg-opt ${prov === v ? 'active' : ''}`}>{v}</div>
            ))}
          </div>
        </div>
        <div className="pg-group">
          <span className="pg-label">Destination</span>
          <div className="pg-options">
            {['INTERNAL_API', 'SAAS_TOOL', 'EXTERNAL_WEBHOOK'].map(v => (
              <div key={v} onClick={() => setDest(v)} className={`pg-opt ${dest === v ? 'active' : ''}`}>{v}</div>
            ))}
          </div>
        </div>
        <div className="pg-group">
          <span className="pg-label">Trajectory</span>
          <div className="pg-options">
            {['CLEAN', 'CREDENTIAL_READ', 'SENSITIVE_OPERATION'].map(v => (
              <div key={v} onClick={() => setTraj(v)} className={`pg-opt ${traj === v ? 'active' : ''}`}>{v}</div>
            ))}
          </div>
        </div>
        <div className="pg-group">
          <span className="pg-label">Authority</span>
          <div className="pg-options">
            {['USER', 'SERVICE', 'SYSTEM'].map(v => (
              <div key={v} onClick={() => setAuth(v)} className={`pg-opt ${auth === v ? 'active' : ''}`}>{v}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="pg-result">
        <div className="decision-display">
          <div className="pg-label">HEED DECISION</div>
          <div className={`dec-tag ${decision}`}>{decision}</div>
          <p className="dec-reason">{reason}</p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    
    const rvs = containerRef.current?.querySelectorAll('.rv') || [];
    rvs.forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${(i % 3) * 100}ms`;
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="heed-landing relative" ref={containerRef}>
      <style>{LandingPageStyles}</style>
      <HeedFlowBackground intensity="landing" density="expressive" />

      {/* Hero */}
      <section style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <div className="wrap">
          <h1 className="rv">Let agents act.<br />Keep control.</h1>
          <p className="rv" style={{ fontSize: '20px', color: 'var(--muted)', marginTop: '24px', maxWidth: '600px' }}>
            HEED is the runtime control layer for autonomous AI agents, governing what they can access, where data can move, and when human approval is required.
          </p>
          <div className="rv" style={{ display: 'flex', gap: '16px', marginTop: '48px' }}>
            <Link to="/app" className="btn btn-solid">Explore HEED</Link>
            <a href="https://github.com/heed/heed" className="btn btn-ghost">View GitHub</a>
          </div>
          
          <div className="rv" style={{ marginTop: '48px' }}>
            <p style={{ fontWeight: 500 }}>Open-source runtime control for autonomous software.</p>
            <p style={{ fontSize: '14px', color: 'var(--faint)', marginTop: '4px' }}>Security model informed by established AI security guidance.</p>
          </div>

          <div className="hero-visual rv">
            <div className="hero-flow">
              <span className="h-node">Intent</span>
              <div className="h-line"></div>
              <span className="h-node">Context</span>
              <div className="h-line"></div>
              <div className="h-boundary"></div>
              <div className="h-line"></div>
              <span className="h-node">Decision</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section style={{ background: 'var(--surface-elevated)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <h2 className="rv" style={{ color: 'var(--faint)' }}>Software was built around requests.</h2>
          <h2 className="rv" style={{ marginTop: '16px' }}>Agents are built around decisions.</h2>
          <p className="rv" style={{ fontSize: '18px', color: 'var(--muted)', marginTop: '32px', maxWidth: '700px' }}>
            Traditional authorization evaluates requests. Autonomous agents create a harder problem: the same action can be safe or dangerous depending on the data involved, where it is going, who initiated it, and what happened before it.
          </p>
        </div>
      </section>

      {/* Industry Numbers */}
      <section>
        <div className="wrap">
          <p className="eyebrow rv">INDUSTRY EVIDENCE</p>
          <div className="stat-grid">
            <div className="stat-item rv">
              <div className="stat-num">97%</div>
              <div className="stat-desc">of organizations reporting an AI-related security incident lacked proper AI access controls.</div>
              <div className="stat-desc" style={{ marginTop: '16px', color: 'var(--faint)', fontSize: '12px' }}>IBM Cost of a Data Breach Report 2025</div>
            </div>
            <div className="stat-item rv">
              <div className="stat-num">63%</div>
              <div className="stat-desc">of breached organizations either lacked an AI governance policy or were still developing one.</div>
              <div className="stat-desc" style={{ marginTop: '16px', color: 'var(--faint)', fontSize: '12px' }}>IBM Cost of a Data Breach Report 2025</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Missing Layer */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2 className="rv">Between intelligence and action,<br />there should be a boundary.</h2>
          <p className="rv" style={{ fontSize: '18px', color: 'var(--muted)', margin: '24px auto 0', maxWidth: '600px' }}>
            Agents can reason across tools, systems, and data. HEED governs the moment that reasoning becomes an external action.
          </p>
        </div>
      </section>

      {/* Context */}
      <section id="product">
        <div className="wrap">
          <h2 className="rv">Context changes the decision.</h2>
          <p className="rv" style={{ fontSize: '18px', color: 'var(--muted)', marginTop: '16px' }}>HEED evaluates more than the action itself.</p>
          
          <div className="ctx-grid rv">
            <div className="ctx-card">
              <h3>AUTHORITY</h3>
              <p>Who initiated the action?</p>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--faint)', marginTop: '16px' }}>USER · SERVICE · SYSTEM</div>
            </div>
            <div className="ctx-card">
              <h3>PROVENANCE</h3>
              <p>What data is involved?</p>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--faint)', marginTop: '16px' }}>TRUSTED · UNTRUSTED · PII · SECRET · REDACTED</div>
            </div>
            <div className="ctx-card">
              <h3>DESTINATION</h3>
              <p>Where is it going?</p>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--faint)', marginTop: '16px' }}>INTERNAL_API · EXTERNAL_WEBHOOK · SAAS_TOOL</div>
            </div>
            <div className="ctx-card">
              <h3>TRAJECTORY</h3>
              <p>What happened before it?</p>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--faint)', marginTop: '16px' }}>credential.read → external_network.write</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Experience */}
      <section style={{ background: 'var(--surface-elevated)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <h2 className="rv">One action.<br />Different context.<br />Different outcome.</h2>
          <Playground />
        </div>
      </section>

      {/* Decision Spectrum */}
      <section>
        <div className="wrap">
          <h2 className="rv">Control isn't binary.</h2>
          <div className="rv" style={{ marginTop: '48px', maxWidth: '600px' }}>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
              <div style={{ fontFamily: 'var(--mono)', width: '150px', color: 'var(--allow-lit)', fontWeight: 500 }}>ALLOW</div>
              <div style={{ color: 'var(--muted)' }}>Proceed normally.</div>
            </div>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
              <div style={{ fontFamily: 'var(--mono)', width: '150px', color: 'var(--allow)', fontWeight: 500 }}>ALLOW_CONSTRAINED</div>
              <div style={{ color: 'var(--muted)' }}>Proceed within defined limits.</div>
            </div>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
              <div style={{ fontFamily: 'var(--mono)', width: '150px', color: 'var(--ask-lit)', fontWeight: 500 }}>ASK</div>
              <div style={{ color: 'var(--muted)' }}>Pause for human intervention.</div>
            </div>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
              <div style={{ fontFamily: 'var(--mono)', width: '150px', color: 'var(--ask)', fontWeight: 500 }}>BOUND_APPROVAL</div>
              <div style={{ color: 'var(--muted)' }}>Proceed only with approval tied to this exact action context.</div>
            </div>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '64px' }}>
              <div style={{ fontFamily: 'var(--mono)', width: '150px', color: 'var(--block-lit)', fontWeight: 500 }}>BLOCK</div>
              <div style={{ color: 'var(--muted)' }}>The action violates a hard boundary.</div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '32px' }}>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <div style={{ fontFamily: 'var(--mono)', width: '150px', color: 'var(--faint)' }}>INVALID</div>
                <div style={{ color: 'var(--faint)', fontSize: '14px' }}>Authorization context no longer matches.</div>
              </div>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ fontFamily: 'var(--mono)', width: '150px', color: 'var(--faint)' }}>FAIL_CLOSED</div>
                <div style={{ color: 'var(--faint)', fontSize: '14px' }}>The runtime cannot safely evaluate the action.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real HEED Scenario */}
      <section style={{ background: 'var(--surface-elevated)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <h2 className="rv">When the context crosses a boundary.</h2>
          <div className="rv" style={{ marginTop: '64px', border: '1px solid var(--line)', borderRadius: '12px', padding: '48px', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--muted)', marginBottom: '48px', overflowX: 'auto' }}>
              <span>Customer records</span> <span>→</span> <span style={{color: 'var(--block-lit)'}}>PII</span> <span>→</span> <span>External webhook</span> <span>→</span> <span>HEED</span> <span>→</span> <span style={{color: 'var(--block-lit)'}}>BLOCK</span>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', letterSpacing: '0.1em', color: 'var(--block-lit)', marginBottom: '8px' }}>IFC_VIOLATION</div>
              <div style={{ fontSize: '20px', color: 'var(--fg)', borderLeft: '2px solid var(--block-lit)', paddingLeft: '24px' }}>
                Customer PII cannot be sent to external webhooks without redaction.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Depth */}
      <section>
        <div className="wrap">
          <h2 className="rv mb-16">A control layer built for real agents.</h2>
          
          <div className="story-row rv" style={{ marginTop: '64px' }}>
            <div>
              <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Information-Flow Control</h3>
              <p style={{ color: 'var(--muted)' }}>Understand what data an agent holds and where it is allowed to go.</p>
            </div>
            <div className="story-visual"><code>PII → external boundary → BLOCK</code></div>
          </div>

          <div className="story-row rv">
            <div className="story-visual"><code>credential.read → external_network.write</code></div>
            <div>
              <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Trajectory-Aware Decisions</h3>
              <p style={{ color: 'var(--muted)' }}>What happened before this action can change what the next action means.</p>
            </div>
          </div>
          
          <div className="story-row rv">
            <div>
              <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Bound Approvals</h3>
              <p style={{ color: 'var(--muted)' }}>Approval is tied to action context instead of becoming a reusable permission token.</p>
            </div>
            <div className="story-visual"><code>arguments + provenance + destination + policy</code></div>
          </div>
        </div>
      </section>

      {/* Developer Experience */}
      <section style={{ background: '#1A1A1A', color: '#EAE6DF' }}>
        <div className="wrap">
          <p className="eyebrow rv" style={{ color: '#A09D94' }}>DEVELOPER EXPERIENCE</p>
          <h2 className="rv" style={{ color: '#fff' }}>Designed to fit the way agents are already built.</h2>
          <p className="rv" style={{ fontSize: '18px', color: '#A09D94', marginTop: '24px', maxWidth: '600px' }}>
            Add runtime control around the tools your agent already uses.
          </p>
          
          <div className="code-block rv">
            <pre>
{`import { Heed } from "@heed/runtime";

const heed = new Heed({
  runtimeUrl: "http://localhost:4000",
  agentId: "support-agent",
  executionId: "exec-123"
});

await heed.execute({
  system: "http",
  operation: "post",
  capability: "external_network.write",
  resource: "webhook/target",
  arguments: { data: "..." },
  provenanceLabels: ["PII"],
  destinationType: "EXTERNAL_WEBHOOK"
}); // Throws HeedError on BLOCK - connector never invoked`}
            </pre>
          </div>
        </div>
      </section>

      {/* Evidence */}
      <section style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <h2 className="rv">Built with evidence, not promises.</h2>
          <p className="rv" style={{ fontSize: '18px', color: 'var(--muted)', marginTop: '24px', maxWidth: '700px' }}>
            HEED's runtime has been evaluated against information-flow violations, approval manipulation, trajectory attacks, missing authorization context, and fail-open conditions.
          </p>
          
          <div className="stat-grid rv">
            <div className="stat-item">
              <div className="stat-num">12</div>
              <div className="stat-desc">adversarial scenarios</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">13</div>
              <div className="stat-desc">deterministic runtime tests</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">4</div>
              <div className="stat-desc">additional adversarial hardening tests</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">36</div>
              <div className="stat-desc">acceptance criteria completed</div>
            </div>
          </div>
          
          <div className="rv" style={{ marginTop: '48px' }}>
            <Link to="/docs" className="btn btn-ghost" style={{ background: 'transparent' }}>Read the security evaluation →</Link>
          </div>
        </div>
      </section>

      {/* Security Transparency & Open Source */}
      <section id="security">
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px' }}>
            <div className="rv">
              <h2>Security you can inspect.</h2>
              <p style={{ color: 'var(--muted)', marginTop: '24px', marginBottom: '40px' }}>
                HEED's security model, assumptions, evaluation methodology, and implementation are available for inspection.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <a href="https://github.com/heed/heed/blob/main/docs/security/threat-model.md" style={{ fontWeight: 500, display: 'block' }}>Threat Model</a>
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Understand assets, boundaries, threats, and assumptions.</span>
                </div>
                <div>
                  <a href="https://github.com/heed/heed/blob/main/docs/security/security-evaluation.md" style={{ fontWeight: 500, display: 'block' }}>Security Evaluation</a>
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Read the adversarial scenarios and results.</span>
                </div>
                <div>
                  <a href="https://github.com/heed/heed" style={{ fontWeight: 500, display: 'block' }}>Source Code</a>
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Inspect the runtime and SDK.</span>
                </div>
              </div>
            </div>
            
            <div className="rv">
              <h2>Don't take the boundary on faith.</h2>
              <p style={{ color: 'var(--muted)', marginTop: '24px' }}>
                Read it. Run it. Inspect it.
              </p>
              
              <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid var(--line)' }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Informed by established security guidance</p>
                <div style={{ display: 'flex', gap: '24px', marginTop: '24px', color: 'var(--muted)', fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 500 }}>
                  <span>OWASP Agentic AI</span>
                  <span>MITRE ATLAS</span>
                  <span>GitHub</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--faint)', marginTop: '16px' }}>Security references, not certifications or endorsements.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--surface-elevated)', borderTop: '1px solid var(--line)', textAlign: 'center', padding: '160px 0' }}>
        <div className="wrap">
          <h2 className="rv">Give autonomous software<br />a boundary.</h2>
          <p className="rv" style={{ fontSize: '18px', color: 'var(--muted)', marginTop: '24px' }}>Let agents move quickly without giving them unlimited authority.</p>
          <div className="rv" style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '48px' }}>
            <Link to="/app" className="btn btn-solid">Explore HEED</Link>
            <a href="https://github.com/heed/heed" className="btn btn-ghost" style={{ background: 'transparent' }}>View GitHub</a>
          </div>
        </div>
      </section>

    </div>
  );
}
