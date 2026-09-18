import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [stuck, setStuck] = useState(false);
  const location = useLocation();
  const isApp = location.pathname.startsWith('/app');

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isApp) return null; // App has its own header layout

  return (
    <header className={`sticky top-0 z-[60] border-b border-transparent transition-all duration-300 ${stuck ? 'border-b-[rgba(255,255,255,0.07)] bg-[#09090b]/80 backdrop-blur-[14px]' : ''}`}>
      <div className="w-full max-w-[1160px] mx-auto px-[28px] flex items-center justify-between h-[66px]">
        <Link to="/" className="font-mono text-[14px] tracking-[0.22em] font-medium text-[var(--fg)]">HEED</Link>
        <nav className="hidden md:flex gap-[30px] text-[14px] text-[var(--muted)]">
          <Link to="/docs" className="hover:text-[var(--fg)] transition-colors">Docs</Link>
          <a href="/#adoption" className="hover:text-[var(--fg)] transition-colors">Pricing</a>
          <a href="/#trajectory" className="hover:text-[var(--fg)] transition-colors">Changelog</a>
        </nav>
        <Link to="/app" className="inline-block bg-[var(--fg)] text-[#09090B] text-[13px] font-medium px-[15px] py-[7px] rounded-full hover:bg-white transition-colors">
          Get access
        </Link>
      </div>
    </header>
  );
}
