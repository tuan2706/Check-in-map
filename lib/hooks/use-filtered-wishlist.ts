import { useMemo } from 'react';
import { haversineDistanceKm } from '@/lib/utils/geo';
import type { CategoryId, WishlistPlaceWithMeta, WishlistPriority } from '@/types';

export type WishlistSortOption = 'added_desc' | 'priority' | 'distance';

const PRIORITY_ORDER: Record<WishlistPriority, number> = { high: 0, medium: 1, low: 2 };

export function useFilteredWishlist(
  items: WishlistPlaceWithMeta[] | undefined,
  query: string,
  categoryIds: CategoryId[],
  sort: WishlistSortOption,
  currentLocation: { lat: number; lng: number } | null
): WishlistPlaceWithMeta[] | undefined {
  return useMemo(() => {
    if (!items) return items;
    const q = query.trim().toLowerCase();

    let result = items.filter((item) => {
      if (q) {
        const matches =
          item.name.toLowerCase().includes(q) ||
          item.address?.toLowerCase().includes(q) ||
          item.notes?.toLowerCase().includes(q) ||
          item.tagNames.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (categoryIds.length > 0 && !categoryIds.includes(item.categoryId)) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sort === 'distance') {
        if (!currentLocation) return 0;
        const da =
          a.lat !== undefined && a.lng !== undefined
            ? haversineDistanceKm(currentLocation, { lat: a.lat, lng: a.lng })
            : Infinity;
        const db =
          b.lat !== undefined && b.lng !== undefined
            ? haversineDistanceKm(currentLocation, { lat: b.lat, lng: b.lng })
            : Infinity;
        return da - db;
      }
      return b.addedAt - a.addedAt;
    });

    return result;
  }, [items, query, categoryIds, sort, currentLocation]);
}
