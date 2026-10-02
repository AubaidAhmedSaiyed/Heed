import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';

interface DemoItem {
  k: [string, string][];
  t: 'ALLOW' | 'ASK' | 'BLOCK';
  c: 't-ok' | 't-warn' | 't-bad';
  w: string;
  a: boolean;
}

const DEMO_DATA: DemoItem[] = [
  {
    k: [
      ['Agent', 'review-agent'],
      ['Objective', 'Review PR 42'],
      ['Capability', 'github.read_pr'],
      ['Resource', 'repo/pull/42'],
    ],
    t: 'ALLOW',
    c: 't-ok',
    w: "Reading a pull request fits the review objective and the agent's contract.",
    a: false,
  },
  {
    k: [
      ['Agent', 'review-agent'],
      ['Objective', 'Review PR 42'],
      ['Capability', 'github.merge'],
      ['Resource', 'repo/pull/42'],
    ],
    t: 'ASK',
    c: 't-warn',
    w: 'A production merge needs approval, and merging is outside a review objective.',
    a: true,
  },
  {
    k: [
      ['Approved', 'merge_method: squash'],
      ['Submitted', 'merge_method: rebase'],
      ['Capability', 'github.merge'],
      ['Resource', 'repo/pull/42'],
    ],
    t: 'BLOCK',
    c: 't-bad',
    w: 'The approval was bound to one exact action. The arguments changed, so it does not apply.',
    a: false,
  },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const currentDemo = DEMO_DATA[activeTab];

  return (
    <div className="heed-site-root">
      <style>{`
        .heed-site-root {
          --bg: #EEF2F1;
          --panel: #FAFCFB;
          --ink: #12201D;
          --mute: #58675F;
          --line: #D5DEDB;
          --deep: #17332D;
          --sky1: #D6E6F0;
          --sky2: #EEF2F1;
          --ok: #2F7D5B;
          --okbg: #DDEFE6;
          --warn: #9A6408;
          --warnbg: #F8EBCF;
          --bad: #A8402F;
          --badbg: #F6DDD8;
          --on: #EAF3EF;
          background: var(--bg);
          color: var(--ink);
          font-family: "Hanken Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif;
          line-height: 1.55;
          min-height: 100vh;
        }

        :root[data-theme="dark"] .heed-site-root,
        :root.dark .heed-site-root {
          --bg: #0F1917;
          --panel: #16231F;
          --ink: #E8F0EC;
          --mute: #9DB0A8;
          --line: #273933;
          --deep: #0A1311;
          --sky1: #17303A;
          --sky2: #0F1917;
          --ok: #6CCB9B;
          --okbg: #17352A;
          --warn: #E4B558;
          --warnbg: #3A2E12;
          --bad: #EE8E7C;
          --badbg: #3A1C17;
        }

        .heed-site-root h1, 
        .heed-site-root h2, 
        .heed-site-root h3 {
          font-family: "Bricolage Grotesque", "Hanken Grotesk", system-ui, sans-serif;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.08;
          margin: 0;
        }

        .heed-site-root a {
          color: inherit;
          text-decoration: none;
        }

        .heed-site-root p {
          margin: 0;
        }

        .heed-site-root .wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .heed-site-root nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 0;
        }

        .heed-site-root .logo {
          font-family: "Bricolage Grotesque", sans-serif;
          font-weight: 700;
          font-size: 22px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .heed-site-root .mark {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: var(--deep);
          display: grid;
          place-items: center;
        }

        .heed-site-root .nav-links {
          display: flex;
          gap: 28px;
          font-size: 15px;
          color: var(--mute);
        }

        .heed-site-root .nav-links a:hover {
          color: var(--ink);
        }

        .heed-site-root .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .heed-site-root .btn {
          display: inline-block;
          padding: 12px 20px;
          border-radius: 999px;
          font: inherit;
          font-weight: 600;
          font-size: 15px;
          border: 1px solid var(--deep);
          background: var(--deep);
          color: var(--on);
          cursor: pointer;
          transition: opacity 0.15s ease, transform 0.1s ease;
        }

        .heed-site-root .btn:hover {
          opacity: 0.92;
        }

        .heed-site-root .btn.alt {
          background: transparent;
          color: var(--ink);
          border-color: var(--ink);
        }

        .heed-site-root .btn.alt:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        :root[data-theme="dark"] .heed-site-root .btn.alt:hover,
        :root.dark .heed-site-root .btn.alt:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .heed-site-root .sky {
          background: radial-gradient(60% 40% at 18% 12%, rgba(255,255,255,0.5) 0, rgba(255,255,255,0) 70%),
                      radial-gradient(50% 35% at 85% 30%, rgba(255,255,255,0.4) 0, rgba(255,255,255,0) 70%),
                      linear-gradient(180deg, var(--sky1), var(--sky2) 90%);
        }

        .heed-site-root .hero {
          text-align: center;
          padding: 48px 0 0;
        }

        .heed-site-root h1 {
          font-size: clamp(36px, 6vw, 68px);
          max-width: 900px;
          margin: 0 auto 18px;
        }

        .heed-site-root .sub {
          max-width: 660px;
          margin: 0 auto 26px;
          color: var(--mute);
          font-size: 18px;
        }

        .heed-site-root .cta {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .heed-site-root .demo {
          margin: 52px auto 0;
          max-width: 920px;
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 18px 18px 0 0;
          box-shadow: 0 30px 80px rgba(23, 51, 45, 0.15);
          text-align: left;
          overflow: hidden;
        }

        .heed-site-root .tabs {
          display: flex;
          gap: 4px;
          padding: 10px;
          border-bottom: 1px solid var(--line);
          overflow-x: auto;
        }

        .heed-site-root .tabs button {
          font: inherit;
          font-size: 14px;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 8px;
          border: 0;
          background: transparent;
          color: var(--mute);
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .heed-site-root .tabs button[aria-selected="true"] {
          background: var(--okbg);
          color: var(--ink);
        }

        .heed-site-root .dgrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 280px;
        }

        .heed-site-root .dgrid > div {
          padding: 24px;
        }

        .heed-site-root .dgrid > div + div {
          border-left: 1px solid var(--line);
        }

        .heed-site-root .lab {
          font-size: 13px;
          color: var(--mute);
          margin-bottom: 10px;
          display: block;
        }

        .heed-site-root .kv {
          display: grid;
          grid-template-columns: 110px 1fr;
          gap: 8px 12px;
          font-size: 14px;
          margin: 0;
        }

        .heed-site-root .kv dt {
          color: var(--mute);
        }

        .heed-site-root .kv dd {
          margin: 0;
          font-family: ui-monospace, Menlo, Consolas, monospace;
          font-size: 13px;
          word-break: break-word;
        }

        .heed-site-root .tag {
          display: inline-block;
          font-size: 13px;
          padding: 4px 12px;
          border-radius: 999px;
          font-weight: 700;
        }

        .heed-site-root .t-ok {
          background: var(--okbg);
          color: var(--ok);
        }

        .heed-site-root .t-warn {
          background: var(--warnbg);
          color: var(--warn);
        }

        .heed-site-root .t-bad {
          background: var(--badbg);
          color: var(--bad);
        }

        .heed-site-root .why {
          margin: 14px 0;
          font-size: 15px;
        }

        .heed-site-root .acts {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        .heed-site-root .sm {
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          padding: 7px 14px;
          border-radius: 8px;
          border: 1px solid var(--line);
          background: var(--panel);
          color: var(--ink);
          user-select: none;
        }

        .heed-site-root .sm.go {
          background: var(--deep);
          color: var(--on);
          border-color: var(--deep);
        }

        .heed-site-root .note {
          font-size: 12px;
          color: var(--mute);
          padding: 10px 24px;
          border-top: 1px solid var(--line);
        }

        .heed-site-root section {
          padding: 96px 0;
        }

        .heed-site-root .head {
          max-width: 720px;
          margin-bottom: 44px;
        }

        .heed-site-root .head h2 {
          font-size: clamp(30px, 4.4vw, 48px);
          margin-bottom: 14px;
        }

        .heed-site-root .head p {
          color: var(--mute);
          font-size: 18px;
        }

        .heed-site-root .gap {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 48px;
          align-items: center;
        }

        .heed-site-root .big {
          font-family: "Bricolage Grotesque", sans-serif;
          font-weight: 700;
          font-size: clamp(84px, 14vw, 168px);
          line-height: 0.9;
          letter-spacing: -0.04em;
        }

        .heed-site-root .src {
          font-size: 13px;
          color: var(--mute);
          margin-top: 14px;
        }

        .heed-site-root .flowd {
          display: flex;
          align-items: stretch;
          gap: 0;
          flex-wrap: wrap;
          margin-bottom: 36px;
        }

        .heed-site-root .node {
          flex: 1;
          min-width: 150px;
          padding: 20px;
          border: 1px solid var(--line);
          background: var(--panel);
          border-radius: 12px;
        }

        .heed-site-root .node.core {
          background: var(--deep);
          color: var(--on);
          border-color: var(--deep);
        }

        .heed-site-root .node b {
          display: block;
          font-family: "Bricolage Grotesque", sans-serif;
          font-size: 19px;
          margin-bottom: 4px;
        }

        .heed-site-root .node span {
          font-size: 14px;
          color: var(--mute);
        }

        .heed-site-root .node.core span {
          color: #A9C2B9;
        }

        .heed-site-root .arr {
          align-self: center;
          padding: 0 12px;
          color: var(--mute);
          font-weight: 700;
          font-size: 20px;
        }

        .heed-site-root .out {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 2px solid var(--ink);
          gap: 24px;
          padding-top: 16px;
        }

        .heed-site-root .out div {
          padding: 8px 12px 0 0;
        }

        .heed-site-root .out h3 {
          font-size: 20px;
          margin: 10px 0 6px;
        }

        .heed-site-root .out p {
          color: var(--mute);
          font-size: 15px;
        }

        .heed-site-root .split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }

        .heed-site-root .vlist {
          list-style: none;
          margin: 0;
          padding: 0;
          border-top: 1px solid var(--line);
        }

        .heed-site-root .vlist li {
          display: grid;
          grid-template-columns: 170px 1fr;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid var(--line);
          font-size: 15px;
          align-items: baseline;
        }

        .heed-site-root .vlist code {
          font-family: ui-monospace, Menlo, Consolas, monospace;
          font-size: 13px;
          font-weight: 700;
        }

        .heed-site-root .vlist span {
          color: var(--mute);
        }

        .heed-site-root .ctx {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
        }

        .heed-site-root .ctx > div {
          padding: 20px 22px;
        }

        .heed-site-root .ctx > div + div {
          border-top: 1px solid var(--line);
        }

        .heed-site-root .ctx p {
          font-size: 14px;
          color: var(--mute);
          margin: 8px 0 12px;
        }

        .heed-site-root .ctx code {
          font-family: ui-monospace, Menlo, Consolas, monospace;
          font-size: 13px;
        }

        .heed-site-root .deep {
          background: var(--deep);
          color: var(--on);
        }

        .heed-site-root .deep .head p,
        .heed-site-root .deep p.m {
          color: #A9C2B9;
        }

        .heed-site-root .pan {
          background: #0C1815;
          border: 1px solid #2A4A41;
          border-radius: 14px;
          padding: 22px;
          font-family: ui-monospace, Menlo, Consolas, monospace;
          font-size: 13px;
          line-height: 1.8;
          color: #CFE3DB;
          overflow-x: auto;
        }

        .heed-site-root .pan .h {
          font-family: "Hanken Grotesk", sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: var(--on);
          margin-bottom: 8px;
          display: block;
        }

        .heed-site-root .pan .g { color: #8CC9AE; }
        .heed-site-root .pan .r { color: #EE8E7C; }
        .heed-site-root .pan .y { color: #E4B558; }
        .heed-site-root .pan .d { color: #6F8C82; }

        .heed-site-root .pre {
          white-space: pre;
          font-family: ui-monospace, Menlo, Consolas, monospace;
          margin: 0;
        }

        .heed-site-root .dev {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 48px;
          align-items: center;
        }

        .heed-site-root .ints {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 22px 0;
        }

        .heed-site-root .ints span {
          border: 1px solid var(--line);
          background: var(--panel);
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 14px;
        }

        .heed-site-root .sec {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
        }

        .heed-site-root .sec ul {
          margin: 0;
          padding: 0;
          list-style: none;
          border-top: 1px solid var(--line);
        }

        .heed-site-root .sec li {
          padding: 14px 0;
          border-bottom: 1px solid var(--line);
          font-size: 15px;
        }

        .heed-site-root .sec li b {
          display: block;
          font-size: 16px;
          margin-bottom: 2px;
        }

        .heed-site-root .sec li span {
          color: var(--mute);
        }

        .heed-site-root .honest {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 24px;
        }

        .heed-site-root .honest h3 {
          font-size: 22px;
          margin-bottom: 10px;
        }

        .heed-site-root .honest p {
          color: var(--mute);
          font-size: 15px;
          margin-top: 10px;
        }

        .heed-site-root .road {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 2px solid var(--ink);
          gap: 20px;
          padding-top: 16px;
        }

        .heed-site-root .road div {
          padding: 10px 10px 0 0;
        }

        .heed-site-root .road h3 {
          font-size: 19px;
          margin: 10px 0 6px;
        }

        .heed-site-root .road p {
          font-size: 14px;
          color: var(--mute);
        }

        .heed-site-root .final {
          text-align: center;
        }

        .heed-site-root .final h2 {
          font-size: clamp(32px, 5vw, 56px);
          max-width: 760px;
          margin: 0 auto 18px;
        }

        .heed-site-root footer {
          border-top: 1px solid var(--line);
          padding: 28px 0;
          color: var(--mute);
          font-size: 14px;
        }

        .heed-site-root footer .wrap {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
        }

        @media (max-width: 860px) {
          .heed-site-root .nav-links { display: none; }
          .heed-site-root .dgrid,
          .heed-site-root .gap,
          .heed-site-root .split,
          .heed-site-root .dev,
          .heed-site-root .sec {
            grid-template-columns: 1fr;
          }
          .heed-site-root .dgrid > div + div {
            border-left: 0;
            border-top: 1px solid var(--line);
          }
          .heed-site-root .road {
            grid-template-columns: 1fr 1fr;
          }
          .heed-site-root .out {
            grid-template-columns: 1fr;
          }
          .heed-site-root .arr {
            display: none;
          }
          .heed-site-root .node {
            margin-bottom: 10px;
          }
          .heed-site-root section {
            padding: 64px 0;
          }
          .heed-site-root .vlist li {
            grid-template-columns: 1fr;
            gap: 2px;
          }
        }

        @media (max-width: 520px) {
          .heed-site-root .road {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Hero & Top Navigation */}
      <div className="sky">
        <div className="wrap">
          <nav>
            <Link className="logo" to="/">
              <span className="mark">
                <svg viewBox="0 0 26 26" width="26" height="26" aria-hidden="true">
                  <rect x="6" y="5.5" width="3.4" height="15" rx="1.2" fill="#EAF3EF" />
                  <rect x="16.6" y="5.5" width="3.4" height="15" rx="1.2" fill="#EAF3EF" />
                  <rect x="6" y="11.6" width="14" height="2.8" rx="1.2" fill="#8CC9AE" />
                </svg>
              </span>
              HEED
            </Link>

            <div className="nav-links">
              <a href="#how">How it works</a>
              <a href="#context">Policies</a>
              <a href="#evidence">Evidence</a>
              <a href="#dev">Developers</a>
              <a href="#security">Security</a>
            </div>

            <div className="nav-right">
              <ThemeSwitcher />
              <Link to="/auth/login" className="btn alt" style={{ padding: '8px 16px', fontSize: '14px' }}>
                Sign in
              </Link>
              <Link className="btn" to="/auth/signup">
                Get started
              </Link>
            </div>
          </nav>

          <header className="hero">
            <h1>Your agent's instructions are not a security boundary. HEED is.</h1>
            <p className="sub">
              HEED sits between your AI agents and the systems they use. It checks every action
              against your policies before it runs: allow it, block it, or ask a person.
            </p>

            <div className="cta">
              <Link className="btn" to="/auth/signup">
                Get started
              </Link>
              <a className="btn alt" href="#how">
                See how it works
              </a>
            </div>

            {/* Interactive Demo */}
            <div className="demo">
              <div className="tabs" role="tablist" aria-label="Example agent actions">
                <button
                  role="tab"
                  aria-selected={activeTab === 0}
                  onClick={() => setActiveTab(0)}
                >
                  Read the pull request
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 1}
                  onClick={() => setActiveTab(1)}
                >
                  Merge to production
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 2}
                  onClick={() => setActiveTab(2)}
                >
                  Change the approved action
                </button>
              </div>

              <div className="dgrid">
                <div>
                  <span className="lab">Agent action</span>
                  <dl className="kv">
                    {currentDemo.k.map(([label, val], idx) => (
                      <React.Fragment key={idx}>
                        <dt>{label}</dt>
                        <dd>{val}</dd>
                      </React.Fragment>
                    ))}
                  </dl>
                </div>

                <div>
                  <span className="lab">HEED decision</span>
                  <div>
                    <span className={`tag ${currentDemo.c}`}>{currentDemo.t}</span>
                    <p className="why">{currentDemo.w}</p>
                    {currentDemo.a && (
                      <div className="acts">
                        <span className="sm">Deny</span>
                        <span className="sm go">Approve once</span>
                        <span className="sm">Terminate</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="note">
                Illustrative example: a code review agent whose objective is to review pull request 42.
              </div>
            </div>
          </header>
        </div>
      </div>

      {/* 97% Stat Section */}
      <section>
        <div className="wrap gap">
          <div className="big" aria-label="97 percent">
            97%
          </div>
          <div>
            <h2 style={{ fontSize: 'clamp(26px, 3.6vw, 40px)', marginBottom: '14px' }}>
              of organizations that reported a breach of an AI model or app lacked proper AI access controls.
            </h2>
            <p style={{ color: 'var(--mute)', fontSize: '18px', maxWidth: '600px' }}>
              Agents now read files, call APIs and change records. Telling them what to do is not
              the same as limiting what they can do. HEED enforces limits at the moment of execution.
            </p>
            <p className="src">Source: IBM Cost of a Data Breach Report 2025.</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="head">
            <h2>Every action passes through one control layer</h2>
            <p>
              Connect your agent with the SDK. HEED intercepts supported tool calls, checks them
              against your policies, and records the result.
            </p>
          </div>

          <div className="flowd">
            <div className="node">
              <b>AI agent</b>
              <span>Decides to act</span>
            </div>
            <span className="arr">→</span>
            <div className="node core">
              <b>HEED runtime</b>
              <span>Evaluates the action</span>
            </div>
            <span className="arr">→</span>
            <div className="node">
              <b>Your systems</b>
              <span>GitHub, HTTP, custom tools</span>
            </div>
          </div>

          <div className="out">
            <div>
              <span className="tag t-ok">ALLOW</span>
              <h3>Run it</h3>
              <p>The action fits the contract, so the connector performs it.</p>
            </div>
            <div>
              <span className="tag t-warn">ASK</span>
              <h3>Pause for a person</h3>
              <p>An operator approves, denies or terminates the run.</p>
            </div>
            <div>
              <span className="tag t-bad">BLOCK</span>
              <h3>Reject it</h3>
              <p>The action never reaches the system. The reason is recorded.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Policies & Context */}
      <section id="context" style={{ paddingTop: 0 }}>
        <div className="wrap split">
          <div>
            <div className="head" style={{ marginBottom: '28px' }}>
              <h2>More than allow or deny</h2>
              <p>
                The same action can be fine in one task and wrong in another. HEED weighs the
                agent's objective and what it has already done, then picks the narrowest verdict
                that works.
              </p>
            </div>

            <ul className="vlist">
              <li>
                <code>ALLOW</code>
                <span>Within the contract. Proceed.</span>
              </li>
              <li>
                <code>ALLOW_CONSTRAINED</code>
                <span>Proceed, but only inside explicit limits.</span>
              </li>
              <li>
                <code>ASK</code>
                <span>A person decides before anything runs.</span>
              </li>
              <li>
                <code>BOUND_APPROVAL</code>
                <span>Approval covers one exact action and its arguments, once.</span>
              </li>
              <li>
                <code>BLOCK</code>
                <span>Rejected, with the reason on record.</span>
              </li>
            </ul>
          </div>

          <div className="ctx">
            <div>
              <span className="lab">Same action: github.merge</span>
            </div>
            <div>
              <b>Objective: review pull request 42</b>
              <p>A review agent has no reason to merge. Its contract lists merging as a no-go.</p>
              <span className="tag t-bad">BLOCK</span>
            </div>
            <div>
              <b>Objective: release version 2.4</b>
              <p>The release agent may merge to main, within its budget, after approval.</p>
              <span className="tag t-warn">BOUND_APPROVAL</span>
            </div>
            <div>
              <b>Objective: release, after 5 merges this run</b>
              <p>It reached its execution budget of 5 merges, so the next one stops.</p>
              <span className="tag t-bad">BLOCK</span>
            </div>
          </div>
        </div>
      </section>

      {/* Evidence & Hash Chain (Deep Dark Theme) */}
      <section className="deep" id="evidence">
        <div className="wrap">
          <div className="head">
            <h2>Approvals that cannot be reused. Records that cannot be quietly edited.</h2>
            <p>
              Approval should cover the action a person reviewed, not a changed one submitted afterward.
            </p>
          </div>

          <div className="split">
            <div className="pan">
              <span className="h">Bound approval</span>
              <pre className="pre">{`approved by priya, single use
merge_method: `}<span className="g">squash</span>{`
resource:     repo/pull/42

`}<span className="d">submitted afterward</span>{`
merge_method: `}<span className="r">rebase</span>{`
resource:     repo/pull/42

result: `}<span className="r">BLOCK</span>{`  arguments differ from approval`}</pre>
            </div>

            <div className="pan">
              <span className="h">Execution record</span>
              <pre className="pre"><span className="g">ALLOW </span> github.read_pr     <span className="d">a91f…c2</span>{'\n'}
<span className="g">ALLOW </span> github.read_files   <span className="d">3be0…7d  ← a91f…c2</span>{'\n'}
<span className="y">ASK   </span> github.merge        <span className="d">c47a…19  ← 3be0…7d</span>{'\n'}
<span className="g">APPR  </span> priya, once         <span className="d">e802…5b  ← c47a…19</span>{'\n'}
<span className="r">BLOCK </span> github.merge        <span className="d">1d6c…ae  ← e802…5b</span>{'\n\n'}
<span className="d">each event is hashed with the one before it</span></pre>
            </div>
          </div>
        </div>
      </section>

      {/* Developer SDK */}
      <section id="dev">
        <div className="wrap dev">
          <div>
            <div className="head" style={{ marginBottom: 0 }}>
              <h2>Add a control layer without rebuilding your agent</h2>
              <p>
                Use the SDK in an existing TypeScript or Node.js agent. Route supported tool calls
                through HEED and keep the rest of your code.
              </p>
            </div>

            <div className="ints">
              <span>GitHub</span>
              <span>HTTP and webhooks</span>
              <span>Custom connectors</span>
              <span>Simulation mode</span>
            </div>

            <Link className="btn" to="/docs/sdk">
              Read the documentation
            </Link>
          </div>

          <div className="pan">
            <pre className="pre"><span className="d">import</span> {'{'} Heed {'}'} <span className="d">from</span> <span className="y">"@heed-ai/runtime"</span>;{'\n\n'}
<span className="d">const</span> heed = <span className="d">new</span> Heed({'{'}{'\n'}
  apiKey: process.env.HEED_API_KEY,{'\n'}
  agentId: <span className="y">"review-agent"</span>{'\n'}
{'}'});{'\n\n'}
<span className="d">const</span> result = <span className="d">await</span> heed.execute({'{'}{'\n'}
  capability: <span className="y">"github.merge"</span>,{'\n'}
  resource: <span className="y">"repo/pull/42"</span>,{'\n'}
  arguments: {'{'} merge_method: <span className="y">"squash"</span> {'}'}{'\n'}
{'}'});</pre>
          </div>
        </div>
      </section>

      {/* Security Properties */}
      <section id="security" style={{ paddingTop: 0 }}>
        <div className="wrap sec">
          <div>
            <div className="head" style={{ marginBottom: 0 }}>
              <h2>The control plane is part of your security boundary</h2>
              <p>
                These are design properties of the runtime. The security documentation lists how each
                one works and where its limits are.
              </p>
            </div>
          </div>

          <div>
            <ul>
              <li>
                <b>Fail closed</b>
                <span>If a policy cannot be evaluated, the action is blocked.</span>
              </li>
              <li>
                <b>Workspace isolation</b>
                <span>Agents, policies, keys and records stay inside their workspace.</span>
              </li>
              <li>
                <b>Revocable API keys</b>
                <span>Runtime access is scoped to a workspace and can be withdrawn.</span>
              </li>
            </ul>

            <div className="honest" style={{ marginTop: '24px' }}>
              <h3>What HEED does not claim</h3>
              <p>
                HEED does not make an agent safe. It limits and records the actions that pass through
                it. It is not a certification, and it does not remove the need to design your agent
                carefully.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="head">
            <h2>Where HEED is going</h2>
            <p>
              Governing single tool calls is the start. These are in development, so availability
              depends on implementation status.
            </p>
          </div>

          <div className="road">
            <div>
              <span className="tag t-warn">In development</span>
              <h3>Context-aware authorization</h3>
              <p>Judge actions against declared objectives and authority.</p>
            </div>
            <div>
              <span className="tag t-warn">In development</span>
              <h3>Provenance-aware controls</h3>
              <p>Let data trust labels decide which actions an agent may take.</p>
            </div>
            <div>
              <span className="tag t-warn">In development</span>
              <h3>Behavioral drift detection</h3>
              <p>Flag meaningful changes in an agent's usual activity.</p>
            </div>
            <div>
              <span className="tag t-warn">In development</span>
              <h3>Constrained execution</h3>
              <p>Hold an agent inside explicit limits for a whole task.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="sky final" id="start">
        <div className="wrap">
          <h2>Give your agents a control layer</h2>
          <p className="sub">
            Connect one agent, set its boundaries, and watch what happens when it acts.
          </p>
          <div className="cta">
            <Link className="btn" to="/auth/signup">
              Get started
            </Link>
            <Link className="btn alt" to="/docs/sdk">
              Read the documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="wrap">
          <span>HEED – Runtime governance for AI agents</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/docs">Documentation</Link>
            <Link to="/docs/security">Security</Link>
            <a
              href="https://github.com/AubaidAhmedSaiyed/Heed"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <Link to="/auth/login">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
