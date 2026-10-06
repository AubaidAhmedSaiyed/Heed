import { Outlet, Link, useLocation } from 'react-router-dom';
import { Book, Code, Shield, PlayCircle, Link as LinkIcon, Terminal } from 'lucide-react';

export default function DocsLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Quickstart', path: '/docs/quickstart', icon: PlayCircle },
    { name: 'SDK Reference', path: '/docs/sdk', icon: Code },
    { name: 'REST API', path: '/docs/api', icon: Terminal },
    { name: 'Core Concepts', path: '/docs/concepts', icon: Book },
    { name: 'Connectors', path: '/docs/connectors', icon: LinkIcon },
    { name: 'Security & Data', path: '/docs/security', icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-12 font-sans">
      <aside className="md:w-64 flex-shrink-0">
        <h3 className="font-semibold text-fg mb-4 uppercase tracking-wider text-xs font-mono">Documentation</h3>
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/docs' && item.path === '/docs/quickstart');
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-deep text-on font-semibold shadow-sm' 
                    : 'text-muted hover:bg-surface-2 hover:text-fg'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-on' : 'text-muted'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      
      <div className="flex-1 min-w-0 max-w-3xl prose prose-headings:font-heading prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-allow">
        <Outlet />
      </div>
    </div>
  );
}
