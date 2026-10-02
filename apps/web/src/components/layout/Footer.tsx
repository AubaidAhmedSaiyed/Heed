import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isApp = location.pathname.startsWith('/app');

  if (isApp) return null;

  return (
    <footer className="bg-bg border-t border-line py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5 text-fg font-heading font-bold text-xl mb-3">
            <span className="w-7 h-7 rounded-lg bg-deep flex items-center justify-center shrink-0">
              <svg viewBox="0 0 26 26" width="22" height="22" aria-hidden="true">
                <rect x="6" y="5.5" width="3.4" height="15" rx="1.2" fill="#EAF3EF" />
                <rect x="16.6" y="5.5" width="3.4" height="15" rx="1.2" fill="#EAF3EF" />
                <rect x="6" y="11.6" width="14" height="2.8" rx="1.2" fill="#8CC9AE" />
              </svg>
            </span>
            <span>HEED</span>
          </div>
          <p className="text-muted text-sm font-sans leading-relaxed">
            The runtime control layer for autonomous software. Intercept, evaluate, and enforce boundaries on agent actions before external side effects.
          </p>
          <p className="text-faint text-xs mt-3">
            Informed by established AI security guidance.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:col-span-2 md:justify-items-end font-sans text-sm">
          <div className="space-y-3">
            <span className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">
              Platform
            </span>
            <Link to="/#how" className="block text-muted hover:text-fg transition-colors">
              How it works
            </Link>
            <Link to="/#context" className="block text-muted hover:text-fg transition-colors">
              Policies & Context
            </Link>
            <Link to="/docs" className="block text-muted hover:text-fg transition-colors">
              Developer SDK
            </Link>
            <a
              href="https://github.com/AubaidAhmedSaiyed/Heed"
              target="_blank"
              rel="noreferrer"
              className="block text-muted hover:text-fg transition-colors"
            >
              GitHub Repository
            </a>
          </div>

          <div className="space-y-3">
            <span className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">
              Transparency
            </span>
            <Link to="/docs/security" className="block text-muted hover:text-fg transition-colors">
              Security Model
            </Link>
            <Link to="/#evidence" className="block text-muted hover:text-fg transition-colors">
              Evidence & Audit
            </Link>
            <Link to="/app" className="block text-fg font-medium hover:underline pt-2">
              Open Control Plane &rarr;
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-line flex flex-wrap justify-between items-center text-xs text-muted gap-4">
        <span>HEED – Runtime governance for AI agents</span>
        <span>Apache 2.0 &bull; Transparent runtime control</span>
      </div>
    </footer>
  );
}
