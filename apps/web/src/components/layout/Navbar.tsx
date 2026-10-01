import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

export default function Navbar() {
  const [stuck, setStuck] = useState(false);
  const location = useLocation();
  const isApp = location.pathname.startsWith('/app');

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isApp) return null;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        stuck
          ? 'bg-bg/90 backdrop-blur-md border-line shadow-sm'
          : 'bg-bg border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="text-fg font-mono font-bold tracking-wider text-xl flex items-center gap-2 hover:opacity-85 transition-opacity"
          >
            <Shield className="w-5 h-5 text-accent" />
            <span>HEED</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
            <a href="#product" className="hover:text-fg transition-colors">
              Product
            </a>
            <a href="#security" className="hover:text-fg transition-colors">
              Security
            </a>
            <Link to="/docs" className="hover:text-fg transition-colors">
              Developers
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
          <ThemeSwitcher />

          <a
            href="https://github.com/heed/heed"
            target="_blank"
            rel="noreferrer"
            className="text-muted hover:text-fg transition-colors hidden sm:block"
          >
            GitHub
          </a>

          <Link
            to="/auth/login"
            className="text-muted hover:text-fg transition-colors hidden sm:block"
          >
            Sign In
          </Link>

          <Link
            to="/app"
            className="bg-fg text-bg px-4 sm:px-5 py-2 sm:py-2.5 rounded text-sm font-medium hover:opacity-90 transition-opacity font-sans"
          >
            Control Plane
          </Link>
        </div>
      </div>
    </header>
  );
}
