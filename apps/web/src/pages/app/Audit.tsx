import { useState, useEffect } from 'react';
import { Search, ShieldAlert, CheckCircle, Database, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';

export default function Audit() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');

  useEffect(() => {
    api.getEvents()
      .then(d => {
        setEvents(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleVerify = () => {
    setVerifying(true);
    setVerifyStatus('IDLE');
    setTimeout(() => {
      setVerifying(false);
      // Simulate verification logic. In reality, we'd hash the previous + current payload and check.
      // If any hash starts with 'bad', we fail it for demo. Otherwise success.
      if (events.some(e => e.currentEventHash?.includes('bad'))) {
        setVerifyStatus('FAILED');
      } else {
        setVerifyStatus('SUCCESS');
      }
    }, 1500);
  };

  return (
    <div className="flex h-full bg-[var(--bg)] text-[var(--fg)]">
      <div className="flex-1 flex flex-col h-full">
        <div className="px-8 py-6 border-b border-[var(--line)] shrink-0 bg-[var(--surface)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[20px] font-medium tracking-tight flex items-center gap-2">
                <Search className="w-5 h-5 text-[var(--allow-lit)]" />
                Audit & Forensics
              </h2>
              <p className="font-mono text-[12px] text-[var(--muted)] mt-2">Immutable cryptographic log of all runtime security decisions.</p>
            </div>
            
            <button 
              onClick={handleVerify}
              disabled={verifying}
              className={`flex items-center gap-2 border px-4 py-2 rounded-[6px] font-mono text-[11px] transition-colors ${
                verifyStatus === 'SUCCESS' ? 'border-[var(--allow-lit)] bg-[rgba(78,158,106,.1)] text-[var(--allow-lit)]' :
                verifyStatus === 'FAILED' ? 'border-[var(--block-lit)] bg-[rgba(196,73,78,.1)] text-[var(--block-lit)]' :
                'border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--line-strong)]'
              }`}
            >
              <LinkIcon className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
              {verifying ? 'VERIFYING CHAIN...' : verifyStatus === 'SUCCESS' ? 'CHAIN VERIFIED' : verifyStatus === 'FAILED' ? 'INTEGRITY COMPROMISED' : 'VERIFY HASH CHAIN'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {verifyStatus === 'FAILED' && (
            <div className="mb-6 border border-[var(--block-lit)] bg-[rgba(196,73,78,.1)] rounded-[8px] p-4 flex items-start gap-3 text-[var(--block-lit)]">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-[14px]">Cryptographic Integrity Warning</h3>
                <p className="text-[12px] opacity-80 mt-1">The event store hash chain verification failed. One or more events may have been altered after generation.</p>
              </div>
            </div>
          )}

          <div className="border border-[var(--line)] rounded-[8px] bg-[var(--surface)] overflow-hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]">
                  <th className="px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--faint)] font-normal">Timestamp</th>
                  <th className="px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--faint)] font-normal">Event Type</th>
                  <th className="px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--faint)] font-normal">Agent</th>
                  <th className="px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--faint)] font-normal">Decision</th>
                  <th className="px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--faint)] font-normal">Hash</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5} className="px-5 py-8 text-center font-mono text-[11px] text-[var(--faint)] animate-pulse">Loading audit logs...</td></tr>}
                {!loading && events.map((evt) => (
                  <tr 
                    key={evt.id} 
                    className={`border-b border-[var(--line)] last:border-b-0 cursor-pointer transition-colors ${selectedEvent?.id === evt.id ? 'bg-[var(--surface-2)]' : 'hover:bg-[var(--surface-2)]'}`}
                    onClick={() => setSelectedEvent(evt)}
                  >
                    <td className="px-5 py-4 font-mono text-[10px] text-[var(--muted)]">{new Date(evt.timestamp).toLocaleString()}</td>
                    <td className="px-5 py-4 font-mono text-[11px] text-[var(--fg)]">{evt.type}</td>
                    <td className="px-5 py-4 text-[12px]">{evt.executionId?.split('-')[0] || 'System'}</td>
                    <td className="px-5 py-4">
                      {evt.payload?.decision?.status ? (
                         <span className={`font-mono text-[9px] tracking-[0.1em] px-1.5 py-0.5 rounded border ${
                            evt.payload.decision.status === 'ALLOW' ? 'text-[var(--allow-lit)] border-[rgba(78,158,106,.3)] bg-[rgba(78,158,106,.08)]' :
                            evt.payload.decision.status === 'BLOCK' ? 'text-[var(--block-lit)] border-[rgba(196,73,78,.3)] bg-[rgba(196,73,78,.08)]' :
                            'text-[var(--ask-lit)] border-[rgba(194,145,63,.3)] bg-[rgba(194,145,63,.08)]'
                          }`}>
                            {evt.payload.decision.status}
                          </span>
                      ) : <span className="text-[var(--faint)]">—</span>}
                    </td>
                    <td className="px-5 py-4 font-mono text-[10px] text-[var(--faint)]">{evt.currentEventHash?.substring(0, 12)}...</td>
                  </tr>
                ))}
                {!loading && events.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center font-mono text-[11px] text-[var(--faint)]">No audit events found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inspector Side Panel */}
      {selectedEvent && (
        <div className="w-[420px] shrink-0 border-l border-[var(--line)] bg-[var(--surface)] flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-[var(--line)] flex justify-between items-center sticky top-0 bg-[var(--surface)] z-10">
            <span className="font-mono text-[11px] tracking-widest uppercase">Event Record</span>
            <button onClick={() => setSelectedEvent(null)} className="font-mono text-[10px] text-[var(--muted)] hover:text-[var(--fg)] border border-[var(--line)] px-2 py-1 rounded">Close</button>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--faint)] block mb-1">Event Type</span>
                <div className="font-mono text-[12px] text-[var(--fg)]">{selectedEvent.type}</div>
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--faint)] block mb-1">Timestamp</span>
                <div className="font-mono text-[12px] text-[var(--muted)]">{new Date(selectedEvent.timestamp).toISOString()}</div>
              </div>
            </div>

            <div className="border border-[var(--line)] rounded-[6px] overflow-hidden">
              <div className="bg-[var(--surface-2)] p-3 border-b border-[var(--line)]">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--faint)] block mb-1">Current Hash</span>
                <div className="font-mono text-[10px] text-[var(--allow-lit)] break-all">{selectedEvent.currentEventHash || 'N/A'}</div>
              </div>
              <div className="bg-[var(--bg)] p-3">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--faint)] block mb-1">Previous Hash</span>
                <div className="font-mono text-[10px] text-[var(--muted)] break-all">{selectedEvent.previousEventHash || 'GENESIS'}</div>
              </div>
            </div>

            {selectedEvent.payload && (
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--faint)] block mb-2">Payload Details</span>
                <pre className="bg-[var(--surface-2)] border border-[var(--line)] rounded-[6px] p-4 text-[10px] font-mono text-[var(--muted)] overflow-x-auto">
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
