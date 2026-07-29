import { cn } from '@/lib/utils/cn';
import type { Category } from '@/types';

interface CategoryBadgeProps {
  category: Pick<Category, 'label' | 'emoji' | 'color'>;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        className
      )}
      style={{
        borderColor: `${category.color}40`,
        backgroundColor: `${category.color}14`,
        color: category.color,
      }}
    >
      <span aria-hidden>{category.emoji}</span>
      {category.label}
    </span>
  );
}
