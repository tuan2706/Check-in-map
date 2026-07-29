import { useMemo } from 'react';
import type { CategoryId, PlaceWithRelations } from '@/types';

export interface PlaceFilters {
  categoryIds: CategoryId[];
  minRating: number; // 0 = không lọc
  favoriteOnly: boolean;
  wouldReturnOnly: boolean;
  wouldRecommendOnly: boolean;
}

export const DEFAULT_FILTERS: PlaceFilters = {
  categoryIds: [],
  minRating: 0,
  favoriteOnly: false,
  wouldReturnOnly: false,
  wouldRecommendOnly: false,
};

export type SortOption = 'newest' | 'oldest' | 'rating_desc' | 'name_asc';

export function countActiveFilters(f: PlaceFilters): number {
  return (
    (f.categoryIds.length > 0 ? 1 : 0) +
    (f.minRating > 0 ? 1 : 0) +
    (f.favoriteOnly ? 1 : 0) +
    (f.wouldReturnOnly ? 1 : 0) +
    (f.wouldRecommendOnly ? 1 : 0)
  );
}

export function useFilteredPlaces(
  places: PlaceWithRelations[] | undefined,
  query: string,
  filters: PlaceFilters,
  sort: SortOption
): PlaceWithRelations[] | undefined {
  return useMemo(() => {
    if (!places) return places;

    const q = query.trim().toLowerCase();

    let result = places.filter((p) => {
      if (q) {
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q) ||
          p.reviewText?.toLowerCase().includes(q) ||
          p.recommendedDish?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.name.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (filters.categoryIds.length > 0 && !filters.categoryIds.includes(p.categoryId)) return false;
      if (filters.minRating > 0 && p.rating < filters.minRating) return false;
      if (filters.favoriteOnly && !p.isFavorite) return false;
      if (filters.wouldReturnOnly && !p.wouldReturn) return false;
      if (filters.wouldRecommendOnly && !p.wouldRecommend) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return a.checkinDate.localeCompare(b.checkinDate);
        case 'rating_desc':
          return b.rating - a.rating;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return b.checkinDate.localeCompare(a.checkinDate);
      }
    });

    return result;
  }, [places, query, filters, sort]);
}
