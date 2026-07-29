'use client';

import { ImageOff } from 'lucide-react';
import { PriorityBadge } from '@/components/wishlist/priority-badge';
import { useWishlistImages } from '@/lib/hooks/use-wishlist-images';
import type { WishlistPlaceWithMeta } from '@/types';

export function WishlistMiniCard({
  item,
  categoryEmoji,
  onClick,
}: {
  item: WishlistPlaceWithMeta;
  categoryEmoji?: string;
  onClick?: () => void;
}) {
  const images = useWishlistImages(item.id);
  const coverUrl = images.find((i) => i.id === item.coverImageId)?.thumbnailUrl ?? images[0]?.thumbnailUrl;

  return (
    <button
      onClick={onClick}
      className="w-36 shrink-0 rounded-2xl border border-border bg-card p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/5"
    >
      <div className="mb-2 h-24 w-full overflow-hidden rounded-xl bg-muted">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh từ Blob URL
          <img src={coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-5 w-5" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <p className="truncate text-h4">
        {categoryEmoji} {item.name}
      </p>
      <div className="mt-1.5">
        <PriorityBadge priority={item.priority} />
      </div>
    </button>
  );
}
