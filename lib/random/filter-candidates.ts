import { haversineDistanceKm } from '@/lib/utils/geo';
import type { RandomCandidate, RandomFilters } from '@/types';

export function filterCandidates(
  candidates: RandomCandidate[],
  filters: RandomFilters,
  currentLocation: { lat: number; lng: number } | null
): RandomCandidate[] {
  return candidates.filter((c) => {
    // Nguồn dữ liệu
    if (filters.source === 'wishlist' && c.kind !== 'wishlist') return false;
    if (filters.source === 'visited' && c.kind !== 'place') return false;
    if (filters.source === 'not_visited' && c.kind !== 'wishlist') return false;
    // 'all' -> không lọc theo nguồn

    if (filters.categoryIds.length > 0 && !filters.categoryIds.includes(c.categoryId)) return false;

    if (filters.maxDistanceKm !== null) {
      if (!currentLocation || c.lat === undefined || c.lng === undefined) return false;
      const d = haversineDistanceKm(currentLocation, { lat: c.lat, lng: c.lng });
      if (d > filters.maxDistanceKm) return false;
    }

    if (filters.minBudget !== null && (c.cost ?? 0) < filters.minBudget) return false;
    if (filters.maxBudget !== null && c.cost !== undefined && c.cost > filters.maxBudget) return false;

    if (filters.priority !== null && c.kind === 'wishlist' && c.priority !== filters.priority) {
      return false;
    }

    if (filters.minRating !== null && c.kind === 'place' && (c.rating ?? 0) < filters.minRating) {
      return false;
    }

    if (filters.wouldReturnOnly && c.kind === 'place' && !c.wouldReturn) return false;

    return true;
  });
}
