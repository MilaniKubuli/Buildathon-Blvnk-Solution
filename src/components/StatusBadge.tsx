import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { TicketStatus } from '../types';

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const isSm = size === 'sm';

  switch (status) {
    case 'open':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider rounded border bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 ${
            isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Clock className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Open</span>
        </span>
      );
    case 'in_progress':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider rounded border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 ${
            isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <AlertTriangle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>In Progress</span>
        </span>
      );
    case 'resolved':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider rounded border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 ${
            isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <CheckCircle2 className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Resolved</span>
        </span>
      );
    case 'duplicate':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider rounded border bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20 ${
            isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Layers className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Duplicate</span>
        </span>
      );
    default:
      return null;
  }
}
