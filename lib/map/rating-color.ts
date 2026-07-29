import type { Rating } from '@/types';

/**
 * Bảng màu rating — dùng đồng nhất cho marker trên bản đồ (Phase 4)
 * và con dấu (RatingStamp) trên card/chi tiết địa điểm.
 * Giữ nguyên theo yêu cầu gốc: 5★ xanh lá -> 1★ đỏ.
 */
const RATING_COLOR_MAP: Record<Rating, string> = {
  5: '#22c55e',
  4: '#3b82f6',
  3: '#eab308',
  2: '#f97316',
  1: '#ef4444',
};

const RATING_LABEL_MAP: Record<Rating, string> = {
  5: 'Xuất sắc',
  4: 'Rất tốt',
  3: 'Bình thường',
  2: 'Chưa ổn',
  1: 'Thất vọng',
};

export function getRatingColor(rating: Rating): string {
  return RATING_COLOR_MAP[rating];
}

export function getRatingLabel(rating: Rating): string {
  return RATING_LABEL_MAP[rating];
}
