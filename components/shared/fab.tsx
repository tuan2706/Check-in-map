'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FabProps {
  onClick?: () => void;
  className?: string;
  label?: string;
}

/**
 * Nút (+) nổi để bắt đầu Check-in. Hiệu ứng "mở rộng" (V2.7): nút hơi phình to
 * và icon xoay 90° khi hover — gợi cảm giác sắp "mở ra" một hành động mới,
 * kết hợp active:scale để có phản hồi rõ ràng khi bấm trên mobile.
 */
export function Fab({ onClick, className, label = 'Check-in' }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'group fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:h-14 hover:w-16 hover:rounded-[28px] hover:brightness-105 active:scale-95 lg:bottom-8 lg:right-8',
        className
      )}
    >
      <Plus
        className="h-7 w-7 transition-transform duration-200 group-hover:rotate-90"
        strokeWidth={2.4}
      />
    </button>
  );
}
