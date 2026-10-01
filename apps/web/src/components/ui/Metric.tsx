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
      className={`border border-line rounded-xl bg-surface p-5 relative overflow-hidden transition-all duration-200 hover:border-line-strong ${className}`}
    >
      {color && (
        <div
          className="absolute top-0 left-0 w-full h-[2px]"
          style={{ backgroundColor: color }}
        />
      )}
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-faint">
          {label}
        </span>
        {Icon && <Icon className="w-4 h-4 text-muted" style={color ? { color } : undefined} />}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-medium tracking-tight text-fg font-sans">{value}</p>
        {trend && (
          <span
            className={`text-xs font-mono ${
              trend.isPositive ? 'text-allow' : 'text-block'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {sub && <p className="font-mono text-xs text-muted mt-2 truncate">{sub}</p>}
    </div>
  );
}

export default Metric;
