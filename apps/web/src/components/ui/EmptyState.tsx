import React from 'react';
import { LucideIcon, HelpCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon = HelpCircle,
  title,
  description,
  actionText,
  onAction,
  actionHref,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-xl border border-line bg-surface/60 transition-all ${className}`}
    >
      <div className="w-12 h-12 rounded-full border border-line flex items-center justify-center mb-4 bg-surface-2/60 text-muted">
        <Icon className="w-5 h-5 text-faint" />
      </div>
      <h3 className="text-base font-medium text-fg mb-1.5">{title}</h3>
      <p className="text-sm text-muted max-w-md font-sans mb-6">{description}</p>

      {actionText && (
        <div>
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center justify-center px-4 py-2 bg-fg text-bg rounded font-medium text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              {actionText}
            </a>
          ) : (
            <Button size="sm" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function LoadingState({
  message = 'Connecting to HEED runtime...',
  className = '',
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-16 text-center ${className}`}>
      <div className="w-6 h-6 border-2 border-line-strong border-t-accent rounded-full animate-spin mb-4" />
      <span className="font-mono text-xs tracking-widest uppercase text-muted">
        {message}
      </span>
    </div>
  );
}

export function ErrorState({
  title = "We couldn't evaluate this action.",
  message = 'HEED failed closed because the runtime context could not be safely resolved.',
  onRetry,
  onDetails,
  className = '',
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDetails?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`p-6 rounded-xl border border-block/30 bg-block-muted text-center max-w-xl mx-auto my-8 ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-block/10 border border-block/20 flex items-center justify-center mx-auto mb-3 text-block">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h3 className="text-base font-medium text-fg mb-1">{title}</h3>
      <p className="text-sm text-muted mb-6 font-mono text-xs">{message}</p>
      <div className="flex items-center justify-center gap-3">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </Button>
        )}
        {onDetails && (
          <Button variant="ghost" size="sm" onClick={onDetails}>
            View details
          </Button>
        )}
      </div>
    </div>
  );
}
