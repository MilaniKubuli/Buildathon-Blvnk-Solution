import React from 'react';
import { AlertCircle, AlertOctagon, Info } from 'lucide-react';
import { UrgencyLevel } from '../types';

interface UrgencyBadgeProps {
  urgency: UrgencyLevel | string;
  size?: 'sm' | 'md' | 'lg';
}

export function UrgencyBadge({ urgency, size = 'md' }: UrgencyBadgeProps) {
  const norm = (urgency || 'low').toLowerCase();

  if (norm === 'high') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <AlertOctagon className="w-3.5 h-3.5" />
        <span className="uppercase tracking-wider">High Urgency</span>
      </span>
    );
  }

  if (norm === 'medium') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <AlertCircle className="w-3.5 h-3.5" />
        <span className="capitalize">Medium Urgency</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Info className="w-3.5 h-3.5" />
      <span className="capitalize">Low Urgency</span>
    </span>
  );
}
