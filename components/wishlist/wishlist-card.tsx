'use client';

import { ImageOff, MapPin, Trash2 } from 'lucide-react';
import { CategoryBadge } from '@/components/place/category-badge';
import { PriorityBadge } from '@/components/wishlist/priority-badge';
import { Button } from '@/components/ui/button';
import { useWishlistImages } from '@/lib/hooks/use-wishlist-images';
import { formatDistance, haversineDistanceKm } from '@/lib/utils/geo';
import type { Category, WishlistPlaceWithMeta } from '@/types';

interface WishlistCardProps {
  item: WishlistPlaceWithMeta;
  category?: Category;
  currentLocation?: { lat: number; lng: number } | null;
  onMarkVisited: () => void;
  onDelete: () => void;
  onClick?: () => void;
}

export function WishlistCard({
  item,
  category,
  currentLocation,
  onMarkVisited,
  onDelete,
  onClick,
}: WishlistCardProps) {
  const images = useWishlistImages(item.id);
  const coverUrl = images.find((img) => img.id === item.coverImageId)?.thumbnailUrl ?? images[0]?.thumbnailUrl;

  const distanceKm =
    currentLocation && item.lat !== undefined && item.lng !== undefined
      ? haversineDistanceKm(currentLocation, { lat: item.lat, lng: item.lng })
      : null;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/5"
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh từ Blob URL
          <img src={coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-5 w-5" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-h4">{item.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {category && <CategoryBadge category={category} />}
          <PriorityBadge priority={item.priority} />
        </div>
        {(item.address || distanceKm !== null) && (
          <p className="mt-1 flex items-center gap-1 truncate text-caption text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            {item.address}
            {distanceKm !== null && <span className="shrink-0">· {formatDistance(distanceKm)}</span>}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onMarkVisited();
          }}
        >
          ✓ Đã trải nghiệm
        </Button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-muted-foreground hover:text-destructive"
          aria-label="Xoá khỏi Wishlist"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
