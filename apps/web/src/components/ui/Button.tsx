import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'ghost' | 'outline' | 'subtle' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'solid',
      size = 'md',
      isLoading = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    let variantCls = 'bg-fg text-bg hover:opacity-90 active:scale-[0.99]';

    switch (variant) {
      case 'ghost':
        variantCls = 'border border-transparent text-fg hover:bg-surface-2 hover:border-line';
        break;
      case 'outline':
        variantCls = 'border border-line text-fg hover:bg-surface-2 hover:border-line-strong';
        break;
      case 'subtle':
        variantCls = 'bg-surface-2 text-fg hover:bg-line border border-line';
        break;
      case 'danger':
        variantCls = 'bg-block text-white hover:opacity-90';
        break;
      case 'solid':
      default:
        variantCls = 'bg-fg text-bg hover:opacity-90 shadow-sm';
        break;
    }

    let sizeCls = 'px-4 py-2 text-sm';
    switch (size) {
      case 'sm':
        sizeCls = 'px-2.5 py-1 text-xs font-mono';
        break;
      case 'lg':
        sizeCls = 'px-6 py-3 text-base';
        break;
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium rounded transition-all duration-200 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50 disabled:pointer-events-none gap-2 ${sizeCls} ${variantCls} ${className}`}
        {...props}
      >
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export default Button;
