'use client';

import { cn } from '@/lib/utils/cn';
import { MAP_STYLE_LABELS, type MapStyleKey } from '@/lib/map/map-styles';

interface MapStyleSwitcherProps {
  value: MapStyleKey;
  onChange: (key: MapStyleKey) => void;
  className?: string;
}

export function MapStyleSwitcher({ value, onChange, className }: MapStyleSwitcherProps) {
  return (
    <div
      className={cn(
        'flex gap-1 rounded-full border border-border bg-card/95 p-1 shadow-md shadow-black/5 backdrop-blur',
        className
      )}
    >
      {(Object.keys(MAP_STYLE_LABELS) as MapStyleKey[]).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
            value === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
          )}
        >
          {MAP_STYLE_LABELS[key]}
        </button>
      ))}
    </div>
  );
}
