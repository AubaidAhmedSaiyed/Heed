import React from 'react';
import { Check, ShieldAlert, AlertCircle, Lock, ShieldX, HelpCircle, XCircle } from 'lucide-react';

export type DecisionStatus =
  | 'ALLOW'
  | 'ALLOW_CONSTRAINED'
  | 'ASK'
  | 'BOUND_APPROVAL'
  | 'BLOCK'
  | 'INVALID'
  | 'FAIL_CLOSED'
  | 'COMPLETED'
  | 'PENDING'
  | 'RUNNING'
  | 'TERMINATED'
  | 'DRAFT'
  | 'PUBLISHED'
  | 'ARCHIVED';

interface StatusBadgeProps {
  status: DecisionStatus | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = 'sm',
  showIcon = false,
  className = '',
}: StatusBadgeProps) {
  const norm = (status || '').toUpperCase();

  let colorClasses = 'border-line text-muted bg-surface-2';
  let IconComponent = AlertCircle;

  switch (norm) {
    case 'ALLOW':
    case 'COMPLETED':
    case 'PUBLISHED':
      colorClasses = 'border-[rgba(62,115,82,0.3)] text-allow bg-allow-muted dark:border-[rgba(92,166,118,0.35)]';
      IconComponent = Check;
      break;

    case 'ALLOW_CONSTRAINED':
      colorClasses = 'border-[rgba(92,140,108,0.35)] text-allow bg-allow-muted';
      IconComponent = Check;
      break;

    case 'ASK':
    case 'PENDING':
    case 'RUNNING':
      colorClasses = 'border-[rgba(179,125,46,0.35)] text-ask bg-ask-muted dark:border-[rgba(219,157,70,0.35)]';
      IconComponent = AlertCircle;
      break;

    case 'BOUND_APPROVAL':
      colorClasses = 'border-accent text-accent bg-accent-muted';
      IconComponent = Lock;
      break;

    case 'BLOCK':
    case 'TERMINATED':
      colorClasses = 'border-[rgba(165,54,59,0.35)] text-block bg-block-muted dark:border-[rgba(201,76,83,0.35)]';
      IconComponent = ShieldX;
      break;

    case 'FAIL_CLOSED':
      colorClasses = 'border-block text-block bg-block-muted font-bold tracking-wider';
      IconComponent = XCircle;
      break;

    case 'INVALID':
    case 'ARCHIVED':
    case 'DRAFT':
    default:
      colorClasses = 'border-line text-muted bg-surface-2';
      IconComponent = HelpCircle;
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] tracking-[0.08em]'
      : 'px-2.5 py-1 text-[11px] tracking-[0.1em]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase font-medium rounded border transition-colors ${sizeClasses} ${colorClasses} ${className}`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{status}</span>
    </span>
  );
}

export default StatusBadge;
