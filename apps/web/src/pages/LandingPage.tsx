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

        .heed-site-root .framework-reference {
          border-top: 1px solid var(--line);
          padding-top: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        .heed-site-root .framework-logos {
          display: flex;
          align-items: center;
          gap: 20px;
          color: var(--mute);
        }

        .heed-site-root .framework-sep {
          color: var(--line);
          font-size: 14px;
          user-select: none;
        }

        .heed-site-root .framework-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .heed-site-root .framework-main {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--ink);
          letter-spacing: -0.01em;
        }

        .heed-site-root .framework-sub {
          font-size: 12px;
          color: var(--mute);
          letter-spacing: 0.01em;
        }

        @media (max-width: 768px) {
          .heed-site-root .framework-reference {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
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
            <h1>Give AI Agents Autonomy. Not Unlimited Authority.</h1>
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

        {/* Framework Reference Citation */}
        <div className="wrap" style={{ marginTop: '36px' }}>
          <div className="framework-reference">
            <div className="framework-logos" aria-label="Referenced Security Frameworks">
              {/* OWASP */}
              <svg
                viewBox="0 0 1736 514"
                style={{ height: '17px', width: 'auto', fill: 'currentColor' }}
                aria-label="OWASP"
                role="img"
              >
                <g transform="translate(0,514) scale(0.1,-0.1)" fill="currentColor" stroke="none">
                  <path d="M2280 5129 c-382 -43 -780 -184 -1089 -385 -549 -359 -913 -844 -1091 -1459 -117 -403 -131 -859 -40 -1279 152 -698 622 -1328 1256 -1683 262 -147 597 -258 904 -300 182 -24 568 -25 718 0 365 59 649 159 928 324 811 482 1274 1296 1274 2239 0 505 -143 982 -418 1394 -116 174 -201 278 -337 416 -395 397 -921 654 -1484 724 -175 21 -473 26 -621 9z m572 -405 c976 -125 1749 -903 1873 -1884 32 -250 13 -557 -50 -807 -151 -598 -566 -1114 -1123 -1397 -864 -437 -1882 -260 -2555 444 -333 347 -535 789 -588 1285 -16 148 -6 417 20 565 89 500 326 927 700 1263 318 286 726 473 1157 531 140 20 416 19 566 0z" />
                  <path d="M3495 4140 c-3 -9 10 -46 30 -84 28 -53 35 -79 35 -122 0 -53 -33 -154 -50 -154 -4 0 -12 11 -18 25 -27 59 -133 71 -169 19 -20 -29 -30 -38 -90 -90 -63 -53 -75 -120 -48 -251 l7 -31 -43 10 c-24 5 -72 7 -105 4 l-61 -6 -52 79 -53 80 12 115 c19 185 -6 202 -34 23 -21 -131 -20 -163 9 -241 14 -37 25 -69 25 -71 0 -8 -82 35 -102 52 -9 9 -35 70 -58 137 -43 128 -55 155 -66 144 -11 -12 54 -287 76 -318 l20 -29 -28 9 c-51 14 -73 30 -160 119 -88 90 -117 97 -61 14 77 -112 146 -170 251 -212 61 -25 87 -46 72 -61 -5 -4 -154 17 -344 50 -584 102 -818 124 -1255 123 -298 -2 -462 -13 -495 -33 -25 -15 5 -56 82 -113 130 -95 266 -177 391 -237 232 -111 370 -145 587 -145 162 0 132 -9 341 102 67 35 67 35 369 65 167 16 306 26 311 21 4 -4 20 -34 34 -66 l25 -58 -22 8 c-13 4 -57 8 -98 8 -100 0 -167 -33 -320 -158 -262 -213 -437 -421 -622 -737 -90 -153 -278 -536 -278 -566 0 -16 48 5 300 130 424 210 685 397 918 659 238 268 286 374 238 524 l-7 22 58 -25 c32 -14 62 -29 67 -34 4 -4 1 -81 -8 -172 -9 -89 -20 -216 -26 -281 -12 -137 -35 -213 -91 -303 -54 -85 -69 -139 -69 -249 0 -98 34 -297 73 -420 50 -163 283 -568 367 -638 42 -36 57 -34 70 10 18 62 32 385 26 583 -13 378 -38 604 -122 1110 -30 179 -54 337 -54 353 0 53 25 26 74 -78 48 -104 49 -104 145 -180 53 -41 99 -75 104 -75 22 0 -2 33 -74 102 -61 58 -85 88 -100 128 l-20 52 31 -22 c33 -24 304 -89 317 -77 12 12 -13 24 -149 69 l-127 42 -27 49 c-14 26 -24 51 -21 54 3 3 40 -6 81 -20 81 -27 103 -27 274 4 110 20 84 31 -65 27 l-139 -3 -71 49 -71 48 1 105 c0 101 1 104 21 98 12 -3 51 -9 88 -12 85 -7 146 19 186 81 15 22 31 43 37 45 5 2 22 17 37 32 45 45 32 128 -26 159 -14 7 -26 16 -26 19 0 9 141 61 163 61 9 0 53 -18 97 -40 44 -22 86 -40 95 -40 42 0 -7 43 -97 85 -73 34 -131 33 -221 -6 l-72 -30 -25 33 c-30 40 -84 95 -127 128 l-32 25 29 70 c38 92 38 147 1 228 -36 79 -67 119 -76 97z" />
                  <path d="M6261 3774 c-57 -8 -144 -28 -193 -44 -191 -64 -286 -163 -323 -336 -21 -101 -22 -1386 0 -1487 54 -254 218 -358 630 -398 132 -13 425 -7 565 11 236 30 402 117 473 248 62 115 62 109 62 872 0 746 -1 759 -52 868 -35 74 -109 145 -196 186 -148 71 -316 96 -637 95 -133 -1 -268 -7 -329 -15z m619 -220 c166 -26 248 -75 293 -172 22 -47 22 -48 22 -737 0 -770 4 -721 -71 -805 -104 -114 -526 -160 -843 -91 -149 33 -211 77 -254 181 l-22 55 0 655 c0 590 2 660 17 710 43 138 149 194 418 220 108 11 325 3 440 -16z" />
                  <path d="M11590 3784 c-216 -26 -329 -56 -416 -112 -98 -63 -157 -152 -184 -272 -17 -79 -26 -1845 -9 -1866 16 -20 241 -20 258 -1 7 10 12 139 13 413 l3 399 585 0 585 0 3 -399 c1 -274 6 -403 13 -413 17 -19 242 -19 258 1 9 11 11 237 8 918 -4 1012 -2 980 -76 1095 -74 115 -193 180 -401 219 -61 12 -158 17 -345 19 -143 2 -276 1 -295 -1z m510 -225 c160 -21 247 -70 295 -163 l30 -60 0 -370 0 -371 -565 -3 c-311 -1 -575 0 -588 3 l-23 6 3 367 c3 347 4 369 24 412 54 118 157 167 390 189 106 10 327 5 434 -10z" />
                  <path d="M13790 3783 c-338 -32 -485 -90 -581 -230 -61 -88 -72 -138 -77 -357 -5 -230 5 -288 68 -384 43 -67 90 -109 169 -150 84 -43 139 -56 581 -127 223 -36 427 -73 454 -83 65 -23 129 -80 154 -140 28 -65 37 -178 23 -287 -26 -190 -77 -238 -301 -286 -192 -41 -494 -29 -688 27 -60 17 -124 69 -152 124 -27 53 -40 140 -40 271 0 68 -4 119 -10 121 -5 2 -66 2 -135 0 l-125 -3 0 -152 c0 -170 8 -235 40 -319 26 -71 102 -156 173 -197 66 -37 189 -76 297 -93 117 -18 595 -18 710 1 313 51 465 178 500 419 15 104 12 347 -5 420 -37 157 -139 261 -311 317 -45 15 -254 54 -503 95 -234 39 -448 77 -474 86 -71 23 -121 76 -142 148 -14 48 -16 84 -12 190 3 72 11 149 19 171 19 58 92 128 158 153 247 91 759 68 901 -41 66 -50 90 -108 101 -246 5 -64 12 -119 17 -124 4 -4 64 -6 132 -5 l124 3 3 94 c4 117 -18 236 -58 317 -76 154 -251 236 -565 263 -111 10 -363 12 -445 4z" />
                  <path d="M7914 3758 c-5 -7 -7 -416 -6 -908 4 -967 4 -974 58 -1083 34 -71 107 -144 179 -181 121 -61 321 -92 530 -83 225 10 355 58 478 178 l68 66 67 -67 c78 -78 173 -128 297 -157 63 -14 119 -18 260 -17 205 0 331 21 442 74 75 35 151 108 188 180 54 107 54 110 55 1088 1 496 -2 907 -5 912 -9 15 -238 13 -253 -2 -9 -9 -12 -214 -12 -863 0 -537 -4 -873 -10 -914 -25 -151 -94 -211 -285 -246 -146 -28 -358 -8 -460 42 -50 25 -94 74 -118 132 l-22 56 -3 889 c-2 624 -6 894 -14 903 -15 19 -241 18 -257 0 -7 -10 -11 -278 -13 -908 l-3 -894 -24 -53 c-30 -66 -94 -123 -163 -146 -92 -30 -235 -41 -356 -28 -148 15 -206 36 -264 93 -87 87 -82 30 -88 1049 l-5 895 -127 3 c-94 2 -128 -1 -134 -10z" />
                  <path d="M15297 3763 c-4 -3 -7 -507 -7 -1119 l0 -1114 23 -5 c12 -3 72 -5 132 -3 l110 3 3 309 c1 208 6 314 13 323 9 10 92 13 423 13 408 0 517 6 632 35 196 50 333 189 376 380 19 85 18 685 -1 770 -22 98 -59 164 -130 235 -103 102 -219 149 -412 170 -104 11 -1152 14 -1162 3z m1146 -227 c161 -31 258 -117 286 -256 7 -30 15 -136 18 -235 6 -205 -7 -368 -38 -450 -23 -61 -80 -125 -138 -155 -96 -48 -132 -52 -562 -57 -296 -4 -412 -2 -427 6 l-22 12 0 568 c0 312 3 571 7 574 3 4 185 7 404 7 304 0 415 -3 472 -14z" />
                </g>
              </svg>

              <span className="framework-sep">•</span>

              {/* NIST */}
              <svg
                viewBox="0 0 646 170.3"
                style={{ height: '14px', width: 'auto', fill: 'currentColor' }}
                aria-label="NIST"
                role="img"
              >
                <path d="M45 0C20 0 0 20 0 45v125h40V45c0-4 5-6 8.5-3.5l104.9 115.1c29 29 77 8 77-31V-.4h-40v126c0 4-5 6-8.3 3.5L77.6 14.1c-10-10-18-14-32.5-14M250.2 0v125a45 45 0 0 0 45 45H463a52.5 52.5 0 0 0 0-105H357.8a12.5 12.5 0 0 1 0-25h177.5v130h40V40h70V0H357.8a52.5 52.5 0 0 0 0 105h105a12.5 12.5 0 0 1 0 25H295.3a5 5 0 0 1-5-5V0z" />
              </svg>

              <span className="framework-sep">•</span>

              {/* MITRE ATLAS */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg
                  viewBox="20.1 15.8 127.16 36.16"
                  style={{ height: '13px', width: 'auto', fill: 'currentColor' }}
                  aria-label="MITRE"
                  role="img"
                >
                  <polygon points="20.1214,51.9442 26.4983,15.9722 33.7078,15.9722 42.1634,38.4724 51.0359,16.1116 57.8285,16.1116 64.3447,51.8048 57.2745,51.8048 53.3922,29.444 44.9378,51.3891 39.8071,51.3879 31.3503,29.3058 27.0534,51.8048 " />
                  <rect x="66.564" y="15.9722" width="6.37683" height="35.6944" />
                  <polygon points="83.7527,51.8048 83.7527,21.9451 75.9893,21.9451 75.9893,15.9722 97.7537,15.9722 97.7537,21.8045 90.1308,21.8045 90.1308,51.8036 " />
                  <polygon points="147.105,51.8048 126.729,51.8048 126.729,15.8352 147.245,15.8175 147.245,21.9451 133.243,21.9451 133.243,31.1117 147.105,31.1117 147.105,36.8035 133.243,36.8059 133.243,46.2489 147.105,46.2489 " />
                  <path d="M99.8336 51.9442l0.13819 -36.1102 14.4864 0c6.23746,0 10.3973,2.67522 10.3277,9.86111 0.553942,10.4151 -8.53354,11.6529 -9.89655,10.9903l10.6962 14.8265 -7.40204 -0.00236223 -10.0324 -14.1486 -0.13819 -6.80557 8.52409 0c2.73782,0.00236223 3.09924,-8.33275 -0.276381,-8.34102l-10.0501 -0.269294 0 29.7215 -6.37683 0.277562z" />
                </svg>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', fontFamily: 'sans-serif', lineHeight: 1 }}>ATLAS</span>
              </div>
            </div>

            <div className="framework-text">
              <span className="framework-main">
                Security design informed by established agentic AI security and governance frameworks.
              </span>
              <span className="framework-sub">
                OWASP Agentic Applications · OWASP AIVSS · NIST AI RMF · MITRE ATLAS
              </span>
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
