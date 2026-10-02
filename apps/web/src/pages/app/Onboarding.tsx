import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, Activity, Zap } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { api } from '../../lib/api';

export default function Onboarding() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentId, setAgentId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [, setIsWaiting] = useState(false);

  const runtimeUrl = ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:4000';
  
  const handleRegisterAgent = async () => {
    try {
      const agent = await api.createAgent({ 
        name: agentName || 'Unnamed Agent', 
        description: agentDescription 
      });
      setAgentId(agent.id);
      
      const key = await api.createApiKey({ name: 'Default Runtime Key' });
      setApiKey(key);
      setStep(2);
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey?.key || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (step === 3) {
      setIsWaiting(true);
      const interval = setInterval(async () => {
        try {
          const overview = await api.getOverview();
          if (overview.executions > 0) {
            clearInterval(interval);
            setIsWaiting(false);
            setStep(4);
          }
        } catch (e) {}
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full bg-surface border border-line rounded-2xl p-8 sm:p-10 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-8 h-8 rounded-lg bg-deep flex items-center justify-center shrink-0">
            <svg viewBox="0 0 26 26" width="24" height="24" aria-hidden="true">
              <rect x="6" y="5.5" width="3.4" height="15" rx="1.2" fill="#EAF3EF" />
              <rect x="16.6" y="5.5" width="3.4" height="15" rx="1.2" fill="#EAF3EF" />
              <rect x="6" y="11.6" width="14" height="2.8" rx="1.2" fill="#8CC9AE" />
            </svg>
          </span>
          <h1 className="text-2xl font-heading font-semibold tracking-tight text-fg">
            Setup HEED Runtime
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8 border-b border-line pb-4 text-xs font-mono">
          <span className={`px-2.5 py-1 rounded-full ${step >= 1 ? 'bg-deep text-on font-semibold' : 'bg-surface-2 text-muted'}`}>1. Identity</span>
          <span className="text-muted">&rarr;</span>
          <span className={`px-2.5 py-1 rounded-full ${step >= 2 ? 'bg-deep text-on font-semibold' : 'bg-surface-2 text-muted'}`}>2. API Key</span>
          <span className="text-muted">&rarr;</span>
          <span className={`px-2.5 py-1 rounded-full ${step >= 3 ? 'bg-deep text-on font-semibold' : 'bg-surface-2 text-muted'}`}>3. SDK</span>
          <span className="text-muted">&rarr;</span>
          <span className={`px-2.5 py-1 rounded-full ${step >= 4 ? 'bg-deep text-on font-semibold' : 'bg-surface-2 text-muted'}`}>4. Verified</span>
        </div>

        {/* Step 1: Register Existing Agent */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-heading font-semibold text-fg mb-1">Step 1: Register your Agent</h2>
              <p className="text-sm text-muted">Identify the existing AI agent you want to integrate with HEED.</p>
            </div>
            <div className="space-y-4">
              <Input 
                label="Agent Name" 
                placeholder="e.g. GitHub PR Reviewer"
                value={agentName} 
                onChange={e => setAgentName(e.target.value)} 
              />
              <Input 
                label="Description (Optional)" 
                placeholder="e.g. Autonomously reviews and merges PRs"
                value={agentDescription} 
                onChange={e => setAgentDescription(e.target.value)} 
              />
            </div>
            <Button onClick={handleRegisterAgent} className="w-full">Register Agent Identity</Button>
          </div>
        )}

        {/* Step 2: API Key */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-allow font-medium text-sm">
              <Check className="w-4 h-4" />
              <span>Agent registered successfully.</span>
            </div>
            <div>
              <h2 className="text-lg font-heading font-semibold text-fg mb-1">Step 2: Save your API Key</h2>
              <p className="text-sm text-muted">You will only see this key once. Keep it secure and provide it to the SDK.</p>
            </div>
            
            <div className="p-4 bg-surface-2 border border-line rounded-xl flex items-center justify-between font-mono text-sm">
              <span className="text-fg font-semibold truncate pr-4">{apiKey?.key}</span>
              <button onClick={copyToClipboard} className="text-muted hover:text-fg transition-colors flex-shrink-0 p-1">
                {copied ? <Check className="w-4 h-4 text-allow" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <Button onClick={() => setStep(3)} className="w-full" variant="solid">I've saved it</Button>
          </div>
        )}

        {/* Step 3: Integrate SDK */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-heading font-semibold text-fg mb-1">Step 3: Integrate the SDK</h2>
              <p className="text-sm text-muted">Install the package and route tool calls through HEED.</p>
            </div>

            <div className="bg-surface-2 p-5 rounded-xl font-mono text-xs border border-line overflow-x-auto">
              <div className="text-muted mb-2"># 1. Install the SDK</div>
              <div className="text-fg font-semibold mb-4">npm install @heed-ai/runtime</div>
              
              <div className="text-muted mb-2"># 2. Initialize in your application</div>
              <div className="text-fg leading-relaxed">
                {`import { Heed } from "@heed-ai/runtime";\n\n`}
                {`const heed = new Heed({\n`}
                {`  apiKey: process.env.HEED_API_KEY,\n`}
                {`  agentId: "${agentId}",\n`}
                {`  runtimeUrl: "${runtimeUrl}"\n`}
                {`});`}
              </div>
            </div>

            <div className="flex items-center justify-center p-4 border border-line border-dashed rounded-xl bg-surface-2/40">
              <div className="flex items-center gap-3 text-sm font-mono text-muted">
                <Activity className="w-4 h-4 animate-pulse text-allow" />
                Waiting for the first execution to reach the Control Plane...
              </div>
            </div>
            
            <Button onClick={() => navigate('/app')} variant="outline" className="w-full text-xs">Skip to Dashboard</Button>
          </div>
        )}

        {/* Step 4: Verification */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-allow-muted flex items-center justify-center mx-auto mb-4 border border-allow/20">
              <Zap className="w-8 h-8 text-allow" />
            </div>
            <h2 className="text-2xl font-heading font-semibold text-fg">Integration Verified!</h2>
            <p className="text-sm text-muted max-w-md mx-auto">
              HEED has successfully received runtime data from your agent. You can now observe and enforce boundaries.
            </p>
            <Button onClick={() => navigate('/app')} className="w-full mt-4">Go to Overview</Button>
          </div>
        )}
      </div>
    </div>
  );
}
