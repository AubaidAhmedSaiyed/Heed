import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface MetricProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function Metric({
  label,
  value,
  sub,
  color,
  icon: Icon,
  trend,
  className = '',
}: MetricProps) {
  return (
    <div
      className={`border border-line rounded-2xl bg-surface p-5 relative overflow-hidden transition-all duration-200 hover:border-line-strong ${className}`}
    >
      {color && (
        <div
          className="absolute top-0 left-0 w-full h-[2px]"
          style={{ backgroundColor: color }}
        />
      )}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] tracking-wider uppercase text-muted">
          {label}
        </span>
        {Icon && <Icon className="w-4 h-4 text-muted" style={color ? { color } : undefined} />}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-heading font-bold tracking-tight text-fg">{value}</p>
        {trend && (
          <span
            className={`text-xs font-mono font-medium ${
              trend.isPositive ? 'text-allow' : 'text-block'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-muted mt-2 truncate font-sans">{sub}</p>}
    </div>
  );
}

export default Metric;
