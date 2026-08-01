'use client';

import { ImageOff, Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useCoverThumbnail } from '@/lib/hooks/use-cover-thumbnail';
import { getRatingColor } from '@/lib/map/rating-color';
import type { Category, PlaceWithRelations } from '@/types';

interface MemoryCardMarkerProps {
  place: PlaceWithRelations;
  category?: Category;
  /** 'small' = chỉ ảnh (zoom xa/trung bình) · 'medium' = ảnh + tên · 'full' = ảnh + tên + rating + danh mục */
  size: 'small' | 'medium' | 'full';
  isSelected: boolean;
  onClick: () => void;
}

const IMAGE_SIZE: Record<MemoryCardMarkerProps['size'], number> = {
  small: 36,
  medium: 52,
  full: 64,
};

/**
 * Signature Feature — "Memory Card Marker": mỗi địa điểm hiện trên bản đồ như 1 tấm thẻ
 * ảnh kỷ niệm (kiểu Polaroid) thay vì chấm ghim vô tri, để bản đồ có cảm giác như 1 cuốn
 * album/nhật ký hành trình. Component này chỉ RENDER — logic quyết định size theo zoom
 * và lọc theo vùng hiển thị nằm ở place-map.tsx (để tối ưu hiệu năng).
 */
export function MemoryCardMarker({ place, category, size, isSelected, onClick }: MemoryCardMarkerProps) {
  const coverUrl = useCoverThumbnail(place.coverImageId);
  const imageSize = IMAGE_SIZE[size];
  const ratingColor = getRatingColor(place.rating);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'memory-card-marker group relative flex -translate-y-1/2 flex-col items-center gap-1 rounded-2xl border-2 bg-card p-1 shadow-md shadow-black/10 transition-all duration-200 ease-out',
        isSelected ? 'z-10 scale-105 border-primary shadow-lg shadow-black/20' : 'border-white hover:scale-105'
      )}
      style={{ width: imageSize + 8 }}
    >
      <div
        className="overflow-hidden rounded-xl bg-muted"
        style={{ width: imageSize, height: imageSize }}
      >
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh từ Blob URL trong IndexedDB
          <img src={coverUrl} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-0.5"
            style={{ backgroundColor: category ? `${category.color}20` : 'hsl(var(--muted))' }}
          >
            {category ? (
              <span style={{ fontSize: imageSize * 0.4 }}>{category.emoji}</span>
            ) : (
              <ImageOff className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            )}
          </div>
        )}
      </div>

      {size !== 'small' && (
        <p className="max-w-full truncate px-0.5 text-[10px] font-medium leading-tight">{place.name}</p>
      )}

      {size === 'full' && (
        <div className="flex items-center gap-1 px-0.5 pb-0.5">
          <Star className="h-2.5 w-2.5" fill={ratingColor} color={ratingColor} strokeWidth={0} />
          <span className="text-[9px] text-muted-foreground">{place.rating}</span>
          {category && <span className="text-[10px]">{category.emoji}</span>}
        </div>
      )}

      {/* Mũi nhọn nhỏ phía dưới chỉ đúng vị trí, giống đuôi bong bóng thoại */}
      <span
        className={cn(
          'absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 bg-card',
          isSelected ? 'border-primary' : 'border-white'
        )}
      />
    </button>
  );
}
