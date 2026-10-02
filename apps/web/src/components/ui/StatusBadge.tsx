import React from 'react';
import { Check, AlertCircle, Lock, ShieldX, HelpCircle, XCircle } from 'lucide-react';

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
    case 'ACTIVE':
      colorClasses = 'border-transparent text-allow bg-allow-muted font-bold';
      IconComponent = Check;
      break;

    case 'ALLOW_CONSTRAINED':
      colorClasses = 'border-transparent text-allow bg-allow-muted font-semibold';
      IconComponent = Check;
      break;

    case 'ASK':
    case 'PENDING':
    case 'RUNNING':
      colorClasses = 'border-transparent text-ask bg-ask-muted font-bold';
      IconComponent = AlertCircle;
      break;

    case 'BOUND_APPROVAL':
      colorClasses = 'border-transparent text-ask bg-ask-muted font-bold';
      IconComponent = Lock;
      break;

    case 'BLOCK':
    case 'TERMINATED':
      colorClasses = 'border-transparent text-block bg-block-muted font-bold';
      IconComponent = ShieldX;
      break;

    case 'FAIL_CLOSED':
      colorClasses = 'border-transparent text-block bg-block-muted font-bold';
      IconComponent = XCircle;
      break;

    case 'INVALID':
    case 'ARCHIVED':
    case 'DRAFT':
    default:
      colorClasses = 'border-line text-muted bg-surface-2 font-medium';
      IconComponent = HelpCircle;
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-[11px]'
      : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono uppercase rounded-full border transition-colors ${sizeClasses} ${colorClasses} ${className}`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{status}</span>
    </span>
  );
}

export default StatusBadge;
