import { X } from 'lucide-react';
import { PriorityBadge } from '@/components/wishlist/priority-badge';
import type { WishlistPlaceWithMeta } from '@/types';

interface WishlistInfoContentProps {
  item: WishlistPlaceWithMeta;
  categoryEmoji?: string;
  onClose: () => void;
}

export function WishlistInfoContent({ item, categoryEmoji, onClose }: WishlistInfoContentProps) {
  return (
    <div className="flex items-center gap-2.5 p-1">
      <div className="min-w-0 flex-1">
        <p className="truncate text-h4">
          {categoryEmoji} {item.name}
        </p>
        <div className="mt-1">
          <PriorityBadge priority={item.priority} />
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="ml-1 shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-accent"
        aria-label="Đóng"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
