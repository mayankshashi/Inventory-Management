import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'outline' | 'neutral';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  compact?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  compact = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`ui-btn ui-btn-${variant} ${compact ? 'ui-btn-compact' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
