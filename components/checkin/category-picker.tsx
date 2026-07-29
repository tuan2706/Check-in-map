'use client';

import { cn } from '@/lib/utils/cn';
import type { Category, CategoryId } from '@/types';

interface CategoryPickerProps {
  categories: Category[];
  value: CategoryId | '';
  onChange: (categoryId: CategoryId) => void;
}

export function CategoryPicker({ categories, value, onChange }: CategoryPickerProps) {
  return (
    <div className="-mx-1 flex flex-wrap gap-2 px-1">
      {categories.map((cat) => {
        const isActive = value === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              isActive ? 'border-transparent text-white' : 'border-border bg-card hover:bg-accent'
            )}
            style={isActive ? { backgroundColor: cat.color } : undefined}
          >
            <span aria-hidden>{cat.emoji}</span>
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
