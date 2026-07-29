'use client';

import { cn } from '@/lib/utils/cn';

interface SegmentedTabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; count?: number }[];
}

export function SegmentedTabs<T extends string>({ value, onChange, options }: SegmentedTabsProps<T>) {
  return (
    <div className="flex rounded-full border border-border bg-muted p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200',
            value === opt.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {opt.label}
          {opt.count !== undefined && (
            <span
              className={cn(
                'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]',
                value === opt.value ? 'bg-accent' : 'bg-transparent'
              )}
            >
              {opt.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
