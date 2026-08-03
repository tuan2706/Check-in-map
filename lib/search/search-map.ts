import { fuzzyMatch, normalizeSearchText } from '@/lib/utils/vietnamese';
import type { CategoryId, PlaceWithRelations, WishlistPlaceWithMeta } from '@/types';

export interface MapSearchResult {
  kind: 'place' | 'wishlist';
  id: number;
  name: string;
  categoryId: CategoryId;
  address?: string;
  lat: number;
  lng: number;
}

const MAX_RESULTS_PER_GROUP = 6;

/**
 * Tìm trong dữ liệu đã lưu (IndexedDB, đã load sẵn trong bộ nhớ) — KHÔNG gọi bất kỳ
 * API/dịch vụ online nào, đúng triết lý offline-first. So khớp đã chuẩn hoá (bỏ dấu,
 * không phân biệt hoa/thường) qua fuzzyMatch — giải quyết yêu cầu "Nguyen Hue" vẫn tìm
 * ra "Nguyễn Huệ".
 */
export function searchMapCandidates(
  query: string,
  places: PlaceWithRelations[],
  wishlist: WishlistPlaceWithMeta[]
): { places: MapSearchResult[]; wishlist: MapSearchResult[] } {
  const q = normalizeSearchText(query);
  if (!q) return { places: [], wishlist: [] };

  const placeResults: MapSearchResult[] = places
    .filter(
      (p) =>
        fuzzyMatch(p.name, q) ||
        fuzzyMatch(p.address, q) ||
        fuzzyMatch(p.reviewText, q) ||
        fuzzyMatch(p.recommendedDish, q) ||
        p.tags.some((t) => fuzzyMatch(t.name, q))
    )
    .slice(0, MAX_RESULTS_PER_GROUP)
    .map((p) => ({
      kind: 'place',
      id: p.id as number,
      name: p.name,
      categoryId: p.categoryId,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
    }));

  const wishlistResults: MapSearchResult[] = wishlist
    .filter(
      (w) =>
        w.lat !== undefined &&
        w.lng !== undefined &&
        (fuzzyMatch(w.name, q) || fuzzyMatch(w.address, q) || fuzzyMatch(w.notes, q) || w.tagNames.some((t) => fuzzyMatch(t, q)))
    )
    .slice(0, MAX_RESULTS_PER_GROUP)
    .map((w) => ({
      kind: 'wishlist',
      id: w.id as number,
      name: w.name,
      categoryId: w.categoryId,
      address: w.address,
      lat: w.lat as number,
      lng: w.lng as number,
    }));

  return { places: placeResults, wishlist: wishlistResults };
}
