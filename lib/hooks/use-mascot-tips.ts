import { useMemo } from 'react';
import { usePlaces } from '@/lib/hooks/use-places';
import { useWishlist } from '@/lib/hooks/use-wishlist';
import { useCurrentLocation } from '@/lib/hooks/use-current-location';
import { haversineDistanceKm } from '@/lib/utils/geo';

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10);
}

function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

/**
 * Trả về danh sách các câu nhắc PHÙ HỢP với tình huống hiện tại (không phải câu cố định) —
 * MascotWidget sẽ chọn ngẫu nhiên 1 câu trong số này mỗi lần hiện lên.
 */
export function useMascotTips(): string[] {
  const places = usePlaces();
  const wishlist = useWishlist();
  const currentLocation = useCurrentLocation();

  return useMemo(() => {
    const tips: string[] = [];

    const checkedInToday = (places ?? []).some((p) => isToday(p.checkinDate));
    if (!checkedInToday) {
      tips.push('Hôm nay bạn chưa check-in địa điểm nào.');
    }

    if (isWeekend()) {
      tips.push('Cuối tuần rồi, thử khám phá một nơi mới nhé.');
      tips.push('Có muốn random một quán cafe gần đây không?');
    }

    if (wishlist && wishlist.length > 0) {
      tips.push(`Bạn còn ${wishlist.length} địa điểm trong Wishlist.`);
    }

    const oldWishlistItem = (wishlist ?? []).find(
      (w) => Date.now() - w.addedAt > 1000 * 60 * 60 * 24 * 90
    );
    if (oldWishlistItem) {
      tips.push(`"${oldWishlistItem.name}" bạn lưu đã lâu rồi, ghé thử chưa?`);
    }

    if (currentLocation) {
      const nearbyCount = [...(places ?? []), ...(wishlist ?? [])].filter((p) => {
        if (p.lat === undefined || p.lng === undefined) return false;
        return haversineDistanceKm(currentLocation, { lat: p.lat, lng: p.lng }) <= 1;
      }).length;
      if (nearbyCount > 0) {
        tips.push(`Bạn đang ở gần ${nearbyCount} địa điểm đã lưu.`);
      }
    }

    const categoryCounts = new Map<string, number>();
    for (const p of places ?? []) {
      categoryCounts.set(p.categoryId, (categoryCounts.get(p.categoryId) ?? 0) + 1);
    }
    const topCategory = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topCategory && topCategory[1] >= 5 && topCategory[0] === 'cafe') {
      tips.push('Có vẻ bạn rất thích cafe ☕.');
    }

    const unratedRecentPlace = (places ?? []).find((p) => !p.reviewText && isToday(p.checkinDate));
    if (unratedRecentPlace) {
      tips.push('Đừng quên viết review sau khi trải nghiệm nhé.');
    }

    tips.push('Hôm nay đi đâu? Bấm vào nút 🎲 để tôi gợi ý nhé.');

    return tips;
  }, [places, wishlist, currentLocation]);
}
