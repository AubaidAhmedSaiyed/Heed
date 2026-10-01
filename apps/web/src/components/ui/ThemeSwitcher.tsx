import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 rounded-md bg-[var(--surface-2)] border border-[var(--line)]">
      <button 
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-sm transition-colors ${theme === 'light' ? 'bg-[var(--surface-elevated)] text-[var(--fg)] shadow-sm' : 'text-[var(--faint)] hover:text-[var(--muted)]'}`}
        title="Light Mode"
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button 
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-sm transition-colors ${theme === 'system' ? 'bg-[var(--surface-elevated)] text-[var(--fg)] shadow-sm' : 'text-[var(--faint)] hover:text-[var(--muted)]'}`}
        title="System Theme"
      >
        <Monitor className="w-3.5 h-3.5" />
      </button>
      <button 
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-sm transition-colors ${theme === 'dark' ? 'bg-[var(--surface-elevated)] text-[var(--fg)] shadow-sm' : 'text-[var(--faint)] hover:text-[var(--muted)]'}`}
        title="Dark Mode"
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
