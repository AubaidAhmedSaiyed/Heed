import React from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full ${maxWidth} bg-surface border border-line-strong rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-surface-2/50">
            <h3 className="text-sm font-medium text-fg font-sans">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded text-muted hover:text-fg hover:bg-line transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  width = 'max-w-md',
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full ${width} h-full bg-surface border-l border-line shadow-2xl flex flex-col animate-in slide-in-from-right duration-200`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-surface-2/50 shrink-0">
            <h3 className="text-sm font-medium text-fg font-sans">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded text-muted hover:text-fg hover:bg-line transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-6 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className = '',
}: {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 border-b border-line mb-6 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`pb-3 px-3 text-xs font-mono uppercase tracking-wider transition-all relative ${
              isActive
                ? 'text-fg font-medium'
                : 'text-muted hover:text-fg'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-line-strong text-fg' : 'bg-surface-2 text-muted'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
            )}
          </button>
        );
      })}
    </div>
  );
}
