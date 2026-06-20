import type { ReactNode } from 'react';
import './Badge.css';

type BadgeVariant = 'attention' | 'info' | 'error' | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  return <span className={`ui-badge ui-badge-${variant}`}>{children}</span>;
}

export function stockBadge(quantity: number, threshold = 10) {
  if (quantity === 0) return <Badge variant="error">Out of stock</Badge>;
  if (quantity <= threshold) return <Badge variant="attention">Low stock</Badge>;
  return <Badge variant="info">In stock</Badge>;
}
