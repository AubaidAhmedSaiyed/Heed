import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isApp = location.pathname.startsWith('/app');

  if (isApp) return null;

  return (
    <footer style={{ borderTop: '1px solid var(--line)', padding: '46px 0 60px' }}>
      <div className="w-full max-w-[1160px] mx-auto px-[28px] grid grid-cols-1 md:grid-cols-4 gap-[28px]">
        <div className="md:col-span-1" style={{ flex: 1.6 }}>
          <div className="font-mono text-[14px] tracking-[0.22em] font-medium text-[var(--fg)] mb-[12px]">HEED</div>
          <div className="text-[12.5px] text-[var(--faint)] max-w-[30ch]">Runtime control for AI agents.</div>
        </div>
        <div>
          <h5 className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-[var(--faint)] font-normal mb-[14px]">Product</h5>
          <Link to="/docs" className="block font-mono text-[12px] text-[var(--muted)] py-[4px] hover:text-[var(--fg)] transition-colors">Docs</Link>
          <a href="/#adoption" className="block font-mono text-[12px] text-[var(--muted)] py-[4px] hover:text-[var(--fg)] transition-colors">Pricing</a>
          <a href="/#trajectory" className="block font-mono text-[12px] text-[var(--muted)] py-[4px] hover:text-[var(--fg)] transition-colors">Changelog</a>
        </div>
        <div>
          <h5 className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-[var(--faint)] font-normal mb-[14px]">Runtime</h5>
          <Link to="/docs/sdk" className="block font-mono text-[12px] text-[var(--muted)] py-[4px] hover:text-[var(--fg)] transition-colors">SDK</Link>
          <Link to="/docs/connectors" className="block font-mono text-[12px] text-[var(--muted)] py-[4px] hover:text-[var(--fg)] transition-colors">Connectors</Link>
          <a href="/#adoption" className="block font-mono text-[12px] text-[var(--muted)] py-[4px] hover:text-[var(--fg)] transition-colors">Contracts</a>
        </div>
        <div>
          <h5 className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-[var(--faint)] font-normal mb-[14px]">Company</h5>
          <a href="#access" className="block font-mono text-[12px] text-[var(--muted)] py-[4px] hover:text-[var(--fg)] transition-colors">About</a>
          <Link to="/docs/security" className="block font-mono text-[12px] text-[var(--muted)] py-[4px] hover:text-[var(--fg)] transition-colors">Security</Link>
          <a href="#access" className="block font-mono text-[12px] text-[var(--muted)] py-[4px] hover:text-[var(--fg)] transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
