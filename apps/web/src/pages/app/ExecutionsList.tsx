import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { List, Search, Filter, ArrowUpRight } from 'lucide-react';
import { api } from '../../lib/api';
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  LoadingState,
  Panel,
  Button,
} from '../../components/ui';

export default function ExecutionsList() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .getExecutions()
      .then((d) => {
        setExecutions(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = executions.filter(
    (e) =>
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      (e.agent?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Runtime Executions"
        subtitle="Live observation and deterministic tracing for autonomous agent tool invocations."
        icon={List}
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <input
                type="text"
                placeholder="Filter by ID or agent..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-surface border border-line pl-8 pr-3 py-1.5 rounded-md text-xs font-mono text-fg placeholder:text-faint focus:outline-none focus:border-accent w-56 sm:w-64"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 hidden sm:inline-flex">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </Button>
          </div>
        }
      />

      {loading ? (
        <LoadingState message="Fetching active runtime executions..." className="py-20" />
      ) : executions.length === 0 ? (
        <EmptyState
          icon={List}
          title="Your runtime is quiet."
          description="Connect an agent via the HEED SDK to begin observing and controlling runtime decisions."
          actionText="View SDK Documentation"
          actionHref="/docs/sdk"
          className="my-12"
        />
      ) : (
        <Panel bodyClassName="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-line bg-surface-2/40 font-mono text-[10px] tracking-wider uppercase text-faint">
                <th className="px-5 py-3 font-normal">Execution</th>
                <th className="px-5 py-3 font-normal">Agent</th>
                <th className="px-5 py-3 font-normal">Authority</th>
                <th className="px-5 py-3 font-normal">Started</th>
                <th className="px-5 py-3 font-normal">Actions</th>
                <th className="px-5 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exec) => (
                <tr
                  key={exec.id}
                  className="border-b border-line last:border-b-0 hover:bg-surface-2/60 transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono">
                    <Link
                      to={`/app/executions/${exec.id}`}
                      className="text-fg hover:text-accent font-medium flex items-center gap-1.5"
                    >
                      <span>{exec.id.split('-')[0]}</span>
                      <ArrowUpRight className="w-3 h-3 text-faint" />
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-muted font-sans font-medium">
                    {exec.agent?.name || exec.agentId}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-faint">
                    {exec.authorityType || 'SERVICE'}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-muted">
                    {new Date(exec.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-fg font-semibold">
                    {exec._count?.actions ?? 0}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={exec.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && executions.length > 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center font-mono text-xs text-faint">
                    No executions match your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
