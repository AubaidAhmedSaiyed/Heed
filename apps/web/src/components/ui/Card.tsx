import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  bordered?: boolean;
}

export function Card({
  children,
  elevated = false,
  bordered = true,
  className = '',
  ...props
}: CardProps) {
  const bgClass = elevated ? 'bg-elevated shadow-sm' : 'bg-surface';
  const borderClass = bordered ? 'border border-line hover:border-line-strong' : '';

  return (
    <div
      className={`rounded-xl p-6 transition-all duration-200 ${bgClass} ${borderClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Panel({
  children,
  title,
  subtitle,
  actions,
  className = '',
  headerClassName = '',
  bodyClassName = '',
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={`rounded-xl border border-line bg-surface overflow-hidden transition-colors ${className}`}>
      {(title || subtitle || actions) && (
        <div className={`px-6 py-4 border-b border-line flex items-center justify-between bg-surface-2/40 ${headerClassName}`}>
          <div>
            {title && typeof title === 'string' ? (
              <h3 className="text-sm font-medium text-fg tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-muted mt-0.5 font-mono">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
