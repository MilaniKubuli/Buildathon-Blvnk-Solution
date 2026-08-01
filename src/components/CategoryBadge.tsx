import React from 'react';
import {
  Droplet,
  Zap,
  AlertTriangle,
  Trash2,
  Biohazard,
  Trees,
  CircleOff,
  HelpCircle,
} from 'lucide-react';
import { IncidentCategory } from '../types';

interface CategoryBadgeProps {
  category: IncidentCategory | string | null;
  size?: 'sm' | 'md' | 'lg';
}

export const CATEGORY_META: Record<
  IncidentCategory,
  { label: string; icon: React.ElementType; colorClass: string }
> = {
  water_leak: {
    label: 'Water Leak',
    icon: Droplet,
    colorClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  electricity_outage: {
    label: 'Electricity Outage',
    icon: Zap,
    colorClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  pothole_traffic: {
    label: 'Pothole / Traffic',
    icon: AlertTriangle,
    colorClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  illegal_dumping: {
    label: 'Illegal Dumping',
    icon: Trash2,
    colorClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  sewage_overflow: {
    label: 'Sewage Overflow',
    icon: Biohazard,
    colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  fallen_tree: {
    label: 'Fallen Tree',
    icon: Trees,
    colorClass: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/20',
  },
  missing_manhole: {
    label: 'Missing Manhole',
    icon: CircleOff,
    colorClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
};

export function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  if (!category || !(category in CATEGORY_META)) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-slate-100 text-slate-600 border-slate-200 ${
          size === 'sm'
            ? 'px-2 py-0.5 text-xs'
            : size === 'lg'
            ? 'px-3.5 py-1 text-sm'
            : 'px-2.5 py-0.5 text-xs'
        }`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
        <span>Uncategorized / Vague</span>
      </span>
    );
  }

  const meta = CATEGORY_META[category as IncidentCategory];
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${meta.colorClass} ${
        size === 'sm'
          ? 'px-2 py-0.5 text-xs'
          : size === 'lg'
          ? 'px-3.5 py-1 text-sm'
          : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{meta.label}</span>
    </span>
  );
}
