import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Utility for Micro-typography
const Eyebrow = ({ num, text, dark = false }: { num: string, text: string, dark?: boolean }) => (
  <div className={`font-mono text-[11px] tracking-[0.12em] uppercase mb-8 ${dark ? 'text-black/45' : 'text-white/45'}`}>
    [ {num} — {text} ]
  </div>
);

// Hero Animation Component
const HeroObject = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const scenarios = [
    {
      action: { system: "github", operation: "read_file", resource: "main.ts", capability: "repository.read" },
      decision: "ALLOW",
      color: "text-emerald-500 border-emerald-500/30",
      bg: "bg-emerald-500/10",
      connectorStatus: "executed"
    },
    {
      action: { system: "http", operation: "post", resource: "webhook", capability: "external_network.write" },
      decision: "ASK",
      color: "text-amber-500 border-amber-500/30",
      bg: "bg-amber-500/10",
      connectorStatus: "paused (awaiting human)"
    },
    {
      action: { system: "github", operation: "read_file", resource: ".env", capability: "credential.read" },
      decision: "BLOCK",
      color: "text-red-500 border-red-500/30",
      bg: "bg-red-500/10",
      connectorStatus: "connector never executed"
    }
  ];

  const current = scenarios[step];

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 p-8 rounded-[24px] border border-white/[0.06] bg-[#0A0A0B] relative overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
      {/* Faint Dot Grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Agent Node */}
        <div className="font-mono text-sm border border-white/[0.06] px-4 py-2 rounded mb-4 text-white/70">
          AI AGENT
        </div>
        <div className="h-8 border-l border-white/[0.06] mb-4"></div>
        
        {/* Action Payload */}
        <div className="font-mono text-[13px] bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl w-full max-w-md mb-4 text-white/70 leading-relaxed transition-all duration-300">
          {'{'}<br/>
          &nbsp;&nbsp;system: <span className="text-white">"{current.action.system}"</span>,<br/>
          &nbsp;&nbsp;operation: <span className="text-white">"{current.action.operation}"</span>,<br/>
          &nbsp;&nbsp;resource: <span className="text-white">"{current.action.resource}"</span>,<br/>
          &nbsp;&nbsp;capability: <span className="text-white">"{current.action.capability}"</span><br/>
          {'}'}
        </div>
        
        <div className="h-8 border-l border-white/[0.06] mb-4"></div>
        
        {/* HEED Node */}
        <div className={`font-mono text-sm px-6 py-2 rounded font-bold border transition-colors duration-300 ${current.bg} ${current.color}`}>
          HEED → {current.decision}
        </div>

        {/* Path down */}
        {current.decision === "BLOCK" ? (
          <div className="flex flex-col items-center my-4 transition-all duration-300">
            <div className="h-8 border-l border-red-500/50 mb-2"></div>
            <div className="w-16 border-t-2 border-red-500"></div>
          </div>
        ) : (
          <div className="h-16 border-l border-white/[0.06] my-4 transition-all duration-300"></div>
        )}

        {/* External System */}
        <div className={`font-mono text-sm px-4 py-2 rounded border transition-colors duration-300 ${
          current.decision === "ALLOW" ? "border-emerald-500/30 text-emerald-500" : 
          current.decision === "ASK" ? "border-amber-500/30 text-amber-500" : 
          "border-white/[0.06] text-white/30"
        }`}>
          EXTERNAL SYSTEM
        </div>
        
        <div className={`mt-4 font-mono text-[11px] uppercase tracking-widest transition-colors duration-300 ${
          current.decision === "BLOCK" ? "text-red-500" : "text-white/40"
        }`}>
          {current.connectorStatus}
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans antialiased selection:bg-white/10">
      
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0A0A0B]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold tracking-tight">HEED</div>
          <div className="flex items-center gap-8 text-sm text-white/70">
            <Link to="/docs" className="hover:text-white transition-colors">Docs</Link>
            <span className="hover:text-white transition-colors cursor-pointer">Pricing</span>
          </div>
          <Link to="/app" className="text-xs font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
            Get access
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6">
        
        {/* 01 HERO */}
        <section className="py-[140px] max-md:py-[80px] flex flex-col items-center text-center">
          <Eyebrow num="01" text="RUNTIME" />
          <h1 className="text-[72px] md:text-[96px] leading-[1.05] tracking-[-0.03em] font-medium mb-6 max-w-4xl">
            Your agent decides what it wants to do. HEED decides whether it happens.
          </h1>
          <p className="text-[15px] leading-[1.6] text-white/70 max-w-[55ch] mb-10">
            Traditional access control asks whether an agent CAN perform an action. HEED decides whether that action SHOULD happen in the execution happening right now.
          </p>
          <div className="flex items-center gap-4 mb-16">
            <Link to="/app" className="bg-white text-black font-medium text-sm px-6 py-3 rounded-full hover:bg-white/90 transition-colors">
              Get access
            </Link>
            <Link to="/docs" className="text-white font-medium text-sm px-6 py-3 rounded-full border border-white/[0.06] hover:bg-white/[0.02] transition-colors">
              Read the docs
            </Link>
          </div>
          <HeroObject />
        </section>

        {/* 02 THE PROBLEM */}
        <section className="py-[140px] max-md:py-[80px] border-t border-white/[0.06]">
          <Eyebrow num="02" text="THE PROBLEM" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <div className="font-mono text-xs text-white/40 mb-4 border border-white/[0.06] p-4 rounded-xl bg-white/[0.02]">
                <div className="text-emerald-500 mb-2">Token Permissions</div>
                repository.read<br/>
                communication.write<br/>
                external_network.write
              </div>
              <p className="text-[15px] leading-[1.6] text-white/70">
                Can the agent perform this action?
              </p>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[15px] leading-[1.6] text-white/70 mb-4">
                Tokens grant static capability. They do not understand intent. If a token holds <span className="font-mono text-white">external_network.write</span>, the agent can transmit data indefinitely. 
              </p>
              <p className="text-[15px] leading-[1.6] text-amber-500">
                But should it?
              </p>
            </div>
          </div>
        </section>

        {/* 03 TRAJECTORY */}
        <section className="py-[140px] max-md:py-[80px] border-t border-white/[0.06]">
          <Eyebrow num="03" text="TRAJECTORY" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-white/[0.06] rounded-[24px] p-8 bg-white/[0.01]">
              <div className="text-sm font-mono text-white/40 mb-6 border-b border-white/[0.06] pb-4">
                OBJECTIVE: "Notify deployment"
              </div>
              <div className="space-y-4 font-mono text-xs text-white/70">
                <div>↓ repository.read</div>
                <div>↓ build_status.read</div>
                <div className="text-emerald-500">→ external_network.write</div>
              </div>
              <div className="mt-8 font-mono text-[11px] text-emerald-500 uppercase tracking-widest border-t border-emerald-500/20 pt-4">
                Result: ALLOW
              </div>
            </div>

            <div className="border border-white/[0.06] rounded-[24px] p-8 bg-white/[0.01]">
              <div className="text-sm font-mono text-white/40 mb-6 border-b border-white/[0.06] pb-4">
                OBJECTIVE: "Review PR"
              </div>
              <div className="space-y-4 font-mono text-xs text-white/70">
                <div>↓ repository.read</div>
                <div>↓ credential.read</div>
                <div className="text-red-500">→ external_network.write</div>
              </div>
              <div className="mt-8 font-mono text-[11px] text-red-500 uppercase tracking-widest border-t border-red-500/20 pt-4">
                Result: BLOCK
              </div>
            </div>
          </div>
        </section>

        {/* 04 ALLOW / ASK / BLOCK */}
        <section className="py-[140px] max-md:py-[80px] border-t border-white/[0.06]">
          <Eyebrow num="04" text="DECISIONS" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-[16px] p-6">
              <h3 className="font-mono text-emerald-500 mb-3">ALLOW</h3>
              <p className="text-[14px] leading-[1.6] text-white/70">
                Action aligns with trajectory. Connector executes normally.
              </p>
            </div>
            <div className="border border-amber-500/20 bg-amber-500/5 rounded-[16px] p-6">
              <h3 className="font-mono text-amber-500 mb-3">ASK</h3>
              <p className="text-[14px] leading-[1.6] text-white/70">
                Action requires clearance. Execution pauses for human approval.
              </p>
            </div>
            <div className="border border-red-500/20 bg-red-500/5 rounded-[16px] p-6">
              <h3 className="font-mono text-red-500 mb-3">BLOCK</h3>
              <p className="text-[14px] leading-[1.6] text-white/70">
                Invariant breach. Zero connector side effects.
              </p>
            </div>
          </div>
        </section>

        {/* 05 OBSERVE -> ENFORCE */}
        <section className="py-[140px] max-md:py-[80px] border-t border-white/[0.06]">
          <Eyebrow num="05" text="ADOPTION" />
          <div className="flex flex-col md:flex-row items-center gap-8 justify-center opacity-70">
            <div className="font-mono text-sm border border-white/[0.1] px-6 py-3 rounded-lg">
              evaluationMode: "OBSERVE"
            </div>
            <div className="hidden md:block w-16 border-t border-white/[0.1]"></div>
            <div className="font-mono text-sm border border-white/[0.1] px-6 py-3 rounded-lg bg-white text-black">
              evaluationMode: "ENFORCE"
            </div>
          </div>
        </section>

      </main>

      {/* 06 CONTROL PLANE (Warm off-white section) */}
      <section className="py-[140px] max-md:py-[80px] bg-[#F7F7F8] text-[#0A0A0B] overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-6">
          <Eyebrow num="06" text="CONTROL PLANE" dark />
          <h2 className="text-[32px] tracking-tight font-medium mb-12">Deterministic visibility.</h2>
          
          <div className="relative">
            <div className="bg-white rounded-[24px] shadow-[0_60px_120px_rgba(0,0,0,0.1)] border border-black/5 p-8 max-w-4xl transform perspective-1000 rotate-y-[-2deg] rotate-x-[2deg] translate-x-12">
              <div className="font-mono text-xs text-black/40 mb-6 border-b border-black/5 pb-4 flex justify-between">
                <span>EXECUTION: exec-123</span>
                <span className="text-red-500">STATUS: BLOCKED</span>
              </div>
              <div className="space-y-4 font-mono text-[13px]">
                <div className="flex justify-between">
                  <span>github.read_file</span>
                  <span className="text-emerald-500">ALLOWED</span>
                </div>
                <div className="flex justify-between">
                  <span>http.post</span>
                  <span className="text-red-500">BLOCKED</span>
                </div>
              </div>
              <div className="mt-8 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-mono text-[11px] space-y-2">
                <div>[CAPABILITY_ESCALATION]</div>
                <div>[OBJECTIVE_DEVIATION]</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 07 INTEGRATION */}
      <main className="max-w-6xl mx-auto px-6">
        <section className="py-[140px] max-md:py-[80px]">
          <Eyebrow num="07" text="INTEGRATION" />
          <p className="text-[15px] leading-[1.6] text-white/70 max-w-[62ch] mb-8">
            Wrap the action. The SDK handles the trajectory state, engine evaluation, and block exceptions automatically.
          </p>
          <div className="bg-[#0D0E10] border border-white/[0.06] rounded-[16px] p-6 font-mono text-[13px] text-white/70 overflow-x-auto shadow-2xl">
            <pre>
<span className="text-white">const</span> heed = <span className="text-white">new</span> Heed({'{'} executionId: <span className="text-amber-300">"exec-1"</span> {'}'});{'\n\n'}
<span className="text-white">await</span> heed.execute({'{'}{'\n'}
{'  '}system: <span className="text-amber-300">"github"</span>,{'\n'}
{'  '}operation: <span className="text-amber-300">"read_file"</span>,{'\n'}
{'  '}resource: <span className="text-amber-300">"repo/.env"</span>,{'\n'}
{'  '}capability: <span className="text-amber-300">"credential.read"</span>{'\n'}
{'}'});
            </pre>
          </div>
        </section>

        {/* 08 HONESTY */}
        <section className="py-[140px] max-md:py-[80px] border-t border-white/[0.06]">
          <Eyebrow num="08" text="BOUNDARIES" />
          <div className="font-mono text-[13px] leading-[1.6] text-white/40 max-w-[62ch]">
            HEED is a deterministic runtime boundary. It is not an enterprise IAM platform. It does not replace SSO. It is not an LLM-based anomaly detector. It evaluates action boundaries precisely.
          </div>
        </section>

        {/* 09 CTA & FOOTER */}
        <section className="py-[140px] max-md:py-[80px] border-t border-white/[0.06] text-center">
          <h2 className="text-[32px] tracking-tight font-medium mb-8">Secure your agent execution.</h2>
          <div className="flex justify-center mb-24">
            <Link to="/app" className="bg-white text-black font-medium text-sm px-6 py-3 rounded-full hover:bg-white/90 transition-colors">
              Open Control Plane
            </Link>
          </div>

          <footer className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row justify-between items-start md:items-center text-xs font-mono text-white/40 gap-4">
            <div>HEED RUNTIME © 2026</div>
            <div className="flex gap-8">
              <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
              <Link to="/app" className="hover:text-white transition-colors">Control Plane</Link>
              <span className="hover:text-white transition-colors cursor-pointer">GitHub</span>
            </div>
          </footer>
        </section>

      </main>
    </div>
  );
}
