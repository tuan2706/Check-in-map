import { useMemo } from 'react';
import { haversineDistanceKm } from '@/lib/utils/geo';
import type { WishlistPlaceWithMeta } from '@/types';

const PRIORITY_SCORE: Record<string, number> = { high: 40, medium: 20, low: 5 };

/**
 * Gợi ý dựa hoàn toàn trên dữ liệu người dùng tự có (không gọi API rating ngoài,
 * vì Google Places API cần trả phí và OSM không có rating đáng tin cậy):
 * - Mức độ muốn đi (High/Medium/Low) — trọng số lớn nhất
 * - Khoảng cách tới vị trí hiện tại — gần hơn thì điểm cao hơn
 * - Ưu tiên đa dạng danh mục trong danh sách gợi ý (tránh gợi ý 5 quán cafe liền)
 */
export function useWeekendSuggestions(
  wishlist: WishlistPlaceWithMeta[] | undefined,
  currentLocation: { lat: number; lng: number } | null,
  limit = 5
): WishlistPlaceWithMeta[] {
  return useMemo(() => {
    if (!wishlist || wishlist.length === 0) return [];

    const scored = wishlist.map((item) => {
      let score = PRIORITY_SCORE[item.priority] ?? 0;

      if (currentLocation && item.lat !== undefined && item.lng !== undefined) {
        const distanceKm = haversineDistanceKm(currentLocation, { lat: item.lat, lng: item.lng });
        // Trong bán kính 15km: càng gần điểm càng cao (tối đa +30). Xa hơn: giảm dần nhẹ.
        score += Math.max(0, 30 - distanceKm * 2);
      } else {
        score += 10; // không rõ khoảng cách -> điểm trung tính
      }

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Đa dạng hoá danh mục: ưu tiên chọn xen kẽ các danh mục khác nhau thay vì lấy top N liên tiếp
    const result: WishlistPlaceWithMeta[] = [];
    const usedCategories = new Set<string>();
    const remaining = [...scored];

    while (result.length < limit && remaining.length > 0) {
      let pickIndex = remaining.findIndex((s) => !usedCategories.has(s.item.categoryId));
      if (pickIndex === -1) pickIndex = 0;
      const [picked] = remaining.splice(pickIndex, 1);
      result.push(picked.item);
      usedCategories.add(picked.item.categoryId);
    }

    return result;
  }, [wishlist, currentLocation, limit]);
}
