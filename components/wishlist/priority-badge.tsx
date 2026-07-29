import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/validation/wishlist-schema';
import type { WishlistPriority } from '@/types';

export function PriorityBadge({ priority }: { priority: WishlistPriority }) {
  const color = PRIORITY_COLORS[priority];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: `${color}18`, color }}
    >
      ⭐ {PRIORITY_LABELS[priority]}
    </span>
  );
}
