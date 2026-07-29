'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onFilterClick?: () => void;
  placeholder?: string;
  className?: string;
}

/**
 * Thanh tìm kiếm nổi kiểu Google Maps: bo tròn hoàn toàn, đổ bóng nhẹ,
 * nút lọc (filter) đi kèm bên phải để mở bottom sheet bộ lọc (xây ở Phase 6).
 */
export function SearchBar({
  value,
  onChange,
  onFilterClick,
  placeholder = 'Tìm địa điểm, món ăn, tag...',
  className,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 shadow-md shadow-black/5',
        className
      )}
    >
      <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Mở bộ lọc"
        >
          <SlidersHorizontal className="h-[18px] w-[18px]" />
        </button>
      )}
    </div>
  );
}
