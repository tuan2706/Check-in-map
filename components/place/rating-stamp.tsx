import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getRatingColor, getRatingLabel } from '@/lib/map/rating-color';
import type { Rating } from '@/types';

interface RatingStampProps {
  rating: Rating;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { box: 'h-10 w-10', star: 'h-3 w-3', text: 'text-[10px]' },
  md: { box: 'h-14 w-14', star: 'h-3.5 w-3.5', text: 'text-xs' },
  lg: { box: 'h-20 w-20', star: 'h-5 w-5', text: 'text-sm' },
} as const;

/**
 * "Con dấu" đánh giá — signature visual element của app, gợi hình ảnh
 * tem đóng dấu hộ chiếu. Viền đứt nét xoay nhẹ, số sao ở giữa, màu đổi
 * theo rating (xanh lá = xuất sắc -> đỏ = thất vọng).
 *
 * Dùng lặp lại trên: Place Card, Place Detail, popup marker trên bản đồ (Phase 4-6).
 */
export function RatingStamp({ rating, size = 'md', showLabel = false, className }: RatingStampProps) {
  const color = getRatingColor(rating);
  const { box, star, text } = SIZE_MAP[size];

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div
        className={cn(
          'flex -rotate-6 items-center justify-center rounded-full border-2 border-dashed font-display',
          box
        )}
        style={{ borderColor: color, color }}
      >
        <div className="flex items-center gap-0.5">
          <Star className={star} fill={color} strokeWidth={0} />
          <span className={cn('font-semibold', text)}>{rating}</span>
        </div>
      </div>
      {showLabel && (
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          {getRatingLabel(rating)}
        </span>
      )}
    </div>
  );
}
