'use client';

import { Star } from 'lucide-react';
import { PRIORITY_COLORS } from '@/lib/validation/wishlist-schema';
import type { WishlistPriority } from '@/types';

interface WishlistMarkerPinProps {
  priority: WishlistPriority;
  onClick?: () => void;
}

/**
 * Wishlist dùng DOM Marker (react-map-gl <Marker>) thay vì layer cluster như Place,
 * vì số lượng Wishlist thường nhỏ hơn nhiều so với check-in — không cần tối ưu hiệu năng
 * bằng clustering, đổi lại có thể vẽ hình dạng tuỳ ý (sao/bookmark) dễ dàng hơn nhiều
 * so với circle layer của MapLibre (chỉ vẽ được hình tròn).
 */
export function WishlistMarkerPin({ priority, onClick }: WishlistMarkerPinProps) {
  const color = PRIORITY_COLORS[priority];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 active:scale-95"
      style={{ backgroundColor: color }}
      aria-label="Địa điểm Wishlist"
    >
      <Star className="h-4 w-4 text-white" fill="white" strokeWidth={0} />
    </button>
  );
}
