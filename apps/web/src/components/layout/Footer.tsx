import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Footer() {
  const location = useLocation();
  const isApp = location.pathname.startsWith('/app');

  if (isApp) return null;

  return (
    <footer className="bg-bg border-t border-line py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 text-fg font-mono font-bold tracking-wider text-lg mb-2">
            <Shield className="w-5 h-5 text-accent" />
            <span>HEED</span>
          </div>
          <p className="text-muted text-sm font-sans">
            The runtime control layer for autonomous software.
          </p>
          <p className="text-faint text-xs font-mono mt-3">
            Informed by established AI security guidance.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:col-span-2 md:justify-items-end font-sans text-sm">
          <div className="space-y-3">
            <span className="block text-[11px] font-mono tracking-wider text-faint uppercase mb-2">
              Platform
            </span>
            <a href="#product" className="block text-muted hover:text-fg transition-colors">
              Product & Flow
            </a>
            <a href="#security" className="block text-muted hover:text-fg transition-colors">
              Security Posture
            </a>
            <Link to="/docs" className="block text-muted hover:text-fg transition-colors">
              Developer SDK
            </Link>
            <a
              href="https://github.com/heed/heed"
              target="_blank"
              rel="noreferrer"
              className="block text-muted hover:text-fg transition-colors"
            >
              GitHub Repository
            </a>
          </div>

          <div className="space-y-3">
            <span className="block text-[11px] font-mono tracking-wider text-faint uppercase mb-2">
              Transparency
            </span>
            <a
              href="https://github.com/heed/heed/blob/main/docs/security/threat-model.md"
              target="_blank"
              rel="noreferrer"
              className="block text-muted hover:text-fg transition-colors"
            >
              Threat Model
            </a>
            <a
              href="https://github.com/heed/heed/blob/main/docs/security/security-evaluation.md"
              target="_blank"
              rel="noreferrer"
              className="block text-muted hover:text-fg transition-colors"
            >
              Security Evaluation
            </a>
            <Link to="/app" className="block text-accent hover:underline font-mono text-xs pt-2">
              Open Control Plane &rarr;
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
