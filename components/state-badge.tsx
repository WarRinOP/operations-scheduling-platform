import React from 'react';
import { JobStatus } from '@/lib/types';
import { STATE_METADATA } from '@/lib/state-machine';

interface StateBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StateBadge: React.FC<StateBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const meta = STATE_METADATA[status] || {
    label: status,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    dotColor: 'bg-slate-500',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${meta.badgeClass} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${meta.dotColor} animate-pulse`}
        />
      )}
      {meta.label}
    </span>
  );
};
