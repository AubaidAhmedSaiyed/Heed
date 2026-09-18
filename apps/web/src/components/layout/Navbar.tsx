import { Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isApp = location.pathname.startsWith('/app');

  if (isApp) return null; // App has its own header layout

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <Shield className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors" />
            <span className="font-bold text-lg tracking-tight">HEED</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <Link to="/#problem" className="hover:text-gray-900 transition-colors">How it works</Link>
            <Link to="/docs" className="hover:text-gray-900 transition-colors">Docs</Link>
            <a href="https://github.com/heed/heed" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">GitHub</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/docs/quickstart" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Get Started</Link>
          <Link to="/app" className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
            Open Control Plane
          </Link>
        </div>
      </div>
    </header>
  );
}
