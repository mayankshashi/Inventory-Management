import type { ReactNode } from 'react';
import './SummaryCard.css';

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  accent?: string;
}

export function SummaryCard({ title, value, icon, accent }: SummaryCardProps) {
  return (
    <div className="summary-card">
      <div className="summary-card-icon" style={accent ? { color: accent } : undefined}>
        {icon}
      </div>
      <div className="summary-card-content">
        <span className="summary-card-title">{title}</span>
        <span className="summary-card-value">{value}</span>
      </div>
    </div>
  );
}
