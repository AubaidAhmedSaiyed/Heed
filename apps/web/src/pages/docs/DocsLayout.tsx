import { Outlet, Link, useLocation } from 'react-router-dom';
import { Book, Code, Shield, Layers, PlayCircle, Link as LinkIcon } from 'lucide-react';

export default function DocsLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Quickstart', path: '/docs/quickstart', icon: PlayCircle },
    { name: 'SDK Reference', path: '/docs/sdk', icon: Code },
    { name: 'Core Concepts', path: '/docs/concepts', icon: Book },
    { name: 'Connectors', path: '/docs/connectors', icon: LinkIcon },
    { name: 'Security & Data', path: '/docs/security', icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-12">
      <aside className="md:w-64 flex-shrink-0">
        <h3 className="font-semibold text-gray-900 mb-4 uppercase tracking-wider text-xs">Documentation</h3>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/docs' && item.path === '/docs/quickstart');
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      
      <div className="flex-1 min-w-0 max-w-3xl prose prose-blue prose-headings:font-bold prose-a:text-blue-600">
        <Outlet />
      </div>
    </div>
  );
}
