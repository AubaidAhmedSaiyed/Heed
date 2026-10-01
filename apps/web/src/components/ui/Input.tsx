import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3.5 py-2 text-sm bg-elevated border border-line rounded-md text-fg placeholder-[var(--faint)] transition-colors focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent ${
            error ? 'border-block focus:border-block focus:ring-block' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-block mt-1 font-mono">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted mt-1 font-mono">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options = [], className = '', children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full px-3.5 py-2 text-sm bg-elevated border border-line rounded-md text-fg transition-colors focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent ${
            error ? 'border-block' : ''
          } ${className}`}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface text-fg">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-xs text-block mt-1 font-mono">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted mt-1 font-mono">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
