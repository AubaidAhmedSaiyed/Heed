import { Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isApp = location.pathname.startsWith('/app');

  if (isApp) return null;

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-gray-400" />
              <span className="font-bold text-gray-900 tracking-tight">HEED</span>
            </Link>
            <p className="text-sm text-gray-500 max-w-sm">
              Runtime control for autonomous software. Evaluate your agent's consequential actions before they reach external systems.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/#problem" className="hover:text-gray-900 transition-colors">How it works</Link></li>
              <li><Link to="/docs/security" className="hover:text-gray-900 transition-colors">Security</Link></li>
              <li><Link to="/app" className="hover:text-gray-900 transition-colors">Control Plane</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/docs" className="hover:text-gray-900 transition-colors">Documentation</Link></li>
              <li><Link to="/docs/quickstart" className="hover:text-gray-900 transition-colors">Quickstart</Link></li>
              <li><Link to="/docs/sdk" className="hover:text-gray-900 transition-colors">SDK Reference</Link></li>
              <li><a href="https://github.com/heed/heed" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">© 2026 HEED. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
