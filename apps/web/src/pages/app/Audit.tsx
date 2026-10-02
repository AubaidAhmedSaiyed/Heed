import { useState, useEffect } from 'react';
import { Database, ShieldAlert, X } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, Panel, StatusBadge, EmptyState, LoadingState } from '../../components/ui';

export default function Audit() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    api.getEvents()
      .then(d => {
        setEvents(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-full bg-bg text-fg overflow-hidden">
      <div className="flex-1 flex flex-col h-full max-w-7xl mx-auto w-full p-6 sm:p-8">
        <PageHeader
          title="Audit & Forensics"
          subtitle="Immutable cryptographic log of all runtime security decisions and platform events."
          icon={Database}
        />

        {loading ? (
          <LoadingState message="Loading audit logs..." className="py-20" />
        ) : events.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No audit events found."
            description="Runtime events will be securely logged here once an agent is connected and executing actions."
            className="my-12"
          />
        ) : (
          <Panel bodyClassName="p-0 overflow-x-auto flex-1 h-[calc(100vh-200px)]">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="sticky top-0 z-10 bg-surface">
                <tr className="border-b border-line bg-surface-2/40 font-mono text-[10px] tracking-wider uppercase text-faint">
                  <th className="px-5 py-3 font-normal">Timestamp</th>
                  <th className="px-5 py-3 font-normal">Event Type</th>
                  <th className="px-5 py-3 font-normal">Agent Execution</th>
                  <th className="px-5 py-3 font-normal">Decision</th>
                  <th className="px-5 py-3 font-normal">Event Hash</th>
                </tr>
              </thead>
              <tbody className="overflow-y-auto">
                {events.map((evt) => (
                  <tr 
                    key={evt.id} 
                    className={`border-b border-line last:border-b-0 cursor-pointer transition-colors ${selectedEvent?.id === evt.id ? 'bg-surface-2/80 border-l-2 border-l-accent' : 'hover:bg-surface-2/40 border-l-2 border-l-transparent'}`}
                    onClick={() => setSelectedEvent(evt)}
                  >
                    <td className="px-5 py-3.5 font-mono text-muted">{new Date(evt.timestamp).toLocaleString()}</td>
                    <td className="px-5 py-3.5 font-mono text-fg">{evt.type}</td>
                    <td className="px-5 py-3.5 font-mono text-muted">{evt.executionId?.split('-')[0] || 'System'}</td>
                    <td className="px-5 py-3.5">
                      {evt.payload?.decision?.status ? (
                         <StatusBadge status={evt.payload.decision.status} />
                      ) : <span className="text-faint">—</span>}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-faint truncate max-w-[120px]">
                      {evt.currentEventHash ? `${evt.currentEventHash.substring(0, 16)}...` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </div>

      {/* Inspector Side Panel */}
      {selectedEvent && (
        <div className="w-full lg:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-line bg-surface flex flex-col h-[50vh] lg:h-full z-20">
          <div className="p-5 border-b border-line flex justify-between items-center sticky top-0 bg-surface z-10">
            <div className="flex items-center gap-2 text-fg font-medium">
              <Database className="w-4 h-4 text-accent" />
              <span className="font-mono text-xs uppercase tracking-wider">Event Record</span>
            </div>
            <button 
              onClick={() => setSelectedEvent(null)} 
              className="p-1 rounded-md text-muted hover:text-fg hover:bg-surface-2 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-faint block mb-1">Event Type</span>
                <div className="font-mono text-xs text-fg">{selectedEvent.type}</div>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-faint block mb-1">Timestamp</span>
                <div className="font-mono text-xs text-muted">{new Date(selectedEvent.timestamp).toISOString()}</div>
              </div>
            </div>

            <div className="border border-line rounded-lg overflow-hidden">
              <div className="bg-surface-2/60 p-4 border-b border-line">
                <span className="font-mono text-[10px] uppercase tracking-wider text-faint block mb-1">Current Hash</span>
                <div className="font-mono text-[11px] text-allow break-all">{selectedEvent.currentEventHash || 'N/A'}</div>
              </div>
              <div className="bg-surface p-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-faint block mb-1">Previous Hash</span>
                <div className="font-mono text-[11px] text-muted break-all">{selectedEvent.previousEventHash || 'GENESIS'}</div>
              </div>
            </div>

            {selectedEvent.payload && (
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-faint block mb-2">Payload Details</span>
                <pre className="bg-surface-2/40 border border-line rounded-lg p-4 text-[11px] font-mono text-muted overflow-x-auto whitespace-pre-wrap">
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
