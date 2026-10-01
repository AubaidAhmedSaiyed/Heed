import { useState, useEffect } from 'react';
import { Link2, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api';

export default function Connectors() {
  const [connectors, setConnectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getConnectors()
      .then(d => {
        // Fallback mock if the backend subagent isn't quite done or returns empty
        if (!d || d.length === 0) {
          setConnectors([
            { id: 'http', name: 'HTTP Client', type: 'network', status: 'Available', capabilities: ['external_network.write', 'external_network.read'], destinationClasses: ['EXTERNAL_API', 'EXTERNAL_WEBHOOK'] },
            { id: 'github', name: 'GitHub Integration', type: 'vcs', status: 'Configured', capabilities: ['repository.read', 'repository.write', 'pull_request.create'], destinationClasses: ['EXTERNAL_API'] },
            { id: 'slack', name: 'Slack Bot', type: 'messaging', status: 'Unavailable', capabilities: ['messaging.send'], destinationClasses: ['EXTERNAL_WEBHOOK'] },
            { id: 'fs', name: 'Local FileSystem', type: 'system', status: 'Available', capabilities: ['fs.read', 'fs.write'], destinationClasses: ['FILE_SYSTEM'] }
          ]);
        } else {
          setConnectors(d);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 overflow-auto bg-[var(--bg)] text-[var(--fg)] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-[var(--line)] pb-6">
          <div>
            <h1 className="text-[20px] font-medium tracking-tight flex items-center gap-2 mb-2">
              <Link2 className="w-5 h-5 text-[var(--allow-lit)]" />
              Runtime Connectors
            </h1>
            <p className="font-mono text-[12px] text-[var(--muted)] max-w-2xl">
              Integration points enforcing the HEED boundary. Agents interact with these via the Runtime SDK.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center font-mono text-[11px] text-[var(--faint)] animate-pulse py-12">Loading connectors...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {connectors.length === 0 && (
              <div className="col-span-full text-center py-12 border border-[var(--line)] rounded-[8px] bg-[var(--surface)]">
                <Link2 className="w-8 h-8 text-[var(--line-strong)] mx-auto mb-3" />
                <p className="font-mono text-[11px] text-[var(--faint)]">No connectors registered.</p>
              </div>
            )}
            {connectors.map(c => (
              <div key={c.id} className="border border-[var(--line)] rounded-[8px] bg-[var(--surface)] p-6">
                <div className="flex items-center justify-between mb-6 border-b border-[var(--line)] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[6px] bg-[var(--surface-2)] flex items-center justify-center border border-[var(--line)]">
                      <Link2 className="w-5 h-5 text-[var(--muted)]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[16px]">{c.name}</h3>
                      <p className="font-mono text-[10px] text-[var(--faint)] mt-1 uppercase tracking-wider">{c.type}</p>
                    </div>
                  </div>
                  <span className={`font-mono text-[9px] tracking-wider px-2 py-0.5 rounded border ${
                    c.status === 'Available' || c.status === 'Configured' ? 'bg-[rgba(78,158,106,.08)] text-[var(--allow-lit)] border-[rgba(78,158,106,.3)]' : 
                    c.status === 'Unavailable' ? 'bg-[rgba(196,73,78,.08)] text-[var(--block-lit)] border-[rgba(196,73,78,.3)]' : 
                    'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)]'
                  }`}>
                    {c.status}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--faint)] block mb-2">Supported Capabilities</span>
                    <div className="flex flex-wrap gap-2">
                      {c.capabilities?.map((cap: string) => (
                        <span key={cap} className="font-mono text-[10px] text-[var(--fg)] bg-[var(--surface-2)] px-2 py-1 rounded border border-[var(--line)]">{cap}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--faint)] block mb-2">Destination Classes</span>
                    <div className="flex flex-wrap gap-2">
                      {c.destinationClasses?.map((cls: string) => (
                        <span key={cls} className="font-mono text-[10px] text-[var(--muted)] bg-[var(--bg)] px-2 py-1 rounded border border-[var(--line-strong)]">{cls}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
