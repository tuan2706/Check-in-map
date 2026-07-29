'use client';

import { cn } from '@/lib/utils/cn';

export type MapVisibility = 'all' | 'visited' | 'wishlist';

interface MapVisibilityFilterProps {
  value: MapVisibility;
  onChange: (v: MapVisibility) => void;
  className?: string;
}

const OPTIONS: { value: MapVisibility; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'visited', label: '📍 Đã đi' },
  { value: 'wishlist', label: '⭐ Wishlist' },
];

export function MapVisibilityFilter({ value, onChange, className }: MapVisibilityFilterProps) {
  return (
    <div
      className={cn(
        'flex gap-1 rounded-full border border-border bg-card/95 p-1 shadow-md shadow-black/5 backdrop-blur',
        className
      )}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
            value === opt.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
