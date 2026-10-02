import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, Copy, Activity, Server, Key, Package, Zap } from 'lucide-react';
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
  const [isWaiting, setIsWaiting] = useState(false);
  
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
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-surface border border-line rounded-xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="text-accent w-6 h-6" />
          <h1 className="text-xl font-bold font-mono tracking-tight">Setup HEED Runtime</h1>
        </div>

        {/* Step 1: Register Existing Agent */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-lg font-medium mb-1">Step 1: Register your Agent</h2>
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
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-4 text-allow">
              <Check className="w-5 h-5" />
              <span className="font-medium">Agent registered successfully.</span>
            </div>
            <div>
              <h2 className="text-lg font-medium mb-1">Step 2: Save your API Key</h2>
              <p className="text-sm text-muted">You will only see this key once. Keep it secure and provide it to the SDK.</p>
            </div>
            
            <div className="p-4 bg-surface-2 border border-line rounded-lg flex items-center justify-between font-mono text-sm">
              <span className="text-accent truncate pr-4">{apiKey?.key}</span>
              <button onClick={copyToClipboard} className="text-muted hover:text-fg transition-colors flex-shrink-0">
                {copied ? <Check className="w-4 h-4 text-allow" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <Button onClick={() => setStep(3)} className="w-full" variant="solid">I've saved it</Button>
          </div>
        )}

        {/* Step 3: Integrate SDK */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-lg font-medium mb-1">Step 3: Integrate the SDK</h2>
              <p className="text-sm text-muted">Install the package and route tool calls through HEED.</p>
            </div>

            <div className="bg-surface-2 p-4 rounded-lg font-mono text-xs border border-line overflow-x-auto">
              <div className="text-faint mb-2"># 1. Install the SDK</div>
              <div className="text-fg mb-4">npm install @heed-ai/runtime</div>
              
              <div className="text-faint mb-2"># 2. Initialize in your application</div>
              <div className="text-accent mb-4">
                {`import { Heed } from "@heed-ai/runtime";\n\n`}
                {`const heed = new Heed({\n`}
                {`  apiKey: process.env.HEED_API_KEY,\n`}
                {`  agentId: "${agentId}",\n`}
                {`  runtimeUrl: "http://localhost:4000"\n`}
                {`});`}
              </div>
            </div>

            <div className="flex items-center justify-center p-4 border border-line border-dashed rounded-lg bg-surface-2/30">
              <div className="flex items-center gap-3 text-sm font-mono text-muted">
                <Activity className="w-4 h-4 animate-pulse text-accent" />
                Waiting for the first execution to reach the Control Plane...
              </div>
            </div>
            
            <Button onClick={() => navigate('/app')} variant="outline" className="w-full text-xs">Skip to Dashboard</Button>
          </div>
        )}

        {/* Step 4: Verification */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-16 h-16 rounded-full bg-allow/20 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-allow" />
            </div>
            <h2 className="text-xl font-medium">Integration Verified!</h2>
            <p className="text-sm text-muted">HEED has successfully received runtime data from your agent. You can now observe and enforce boundaries.</p>
            <Button onClick={() => navigate('/app')} className="w-full mt-4">Go to Overview</Button>
          </div>
        )}
      </div>
    </div>
  );
}
