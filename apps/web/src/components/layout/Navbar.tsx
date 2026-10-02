import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="text-fg font-heading font-bold text-xl flex items-center gap-2.5 hover:opacity-85 transition-opacity"
          >
            <span className="w-7 h-7 rounded-lg bg-deep flex items-center justify-center shrink-0">
              <svg viewBox="0 0 26 26" width="22" height="22" aria-hidden="true">
                <rect x="6" y="5.5" width="3.4" height="15" rx="1.2" fill="#EAF3EF" />
                <rect x="16.6" y="5.5" width="3.4" height="15" rx="1.2" fill="#EAF3EF" />
                <rect x="6" y="11.6" width="14" height="2.8" rx="1.2" fill="#8CC9AE" />
              </svg>
            </span>
            <span>HEED</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted">
            <Link to="/#how" className="hover:text-fg transition-colors">
              How it works
            </Link>
            <Link to="/#context" className="hover:text-fg transition-colors">
              Policies
            </Link>
            <Link to="/#evidence" className="hover:text-fg transition-colors">
              Evidence
            </Link>
            <Link to="/docs" className="hover:text-fg transition-colors">
              Developers
            </Link>
            <Link to="/#security" className="hover:text-fg transition-colors">
              Security
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
          <ThemeSwitcher />

          <a
            href="https://github.com/AubaidAhmedSaiyed/Heed"
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
            Sign in
          </Link>

          <Link
            to="/app"
            className="bg-deep text-on px-4 sm:px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity border border-deep shadow-sm"
          >
            Control Plane
          </Link>
        </div>
      </div>
    </header>
  );
}
