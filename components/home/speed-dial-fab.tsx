'use client';

import { useState } from 'react';
import { Plus, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SpeedDialFabProps {
  onCheckin: () => void;
  onWishlist: () => void;
  className?: string;
}

/**
 * FAB mở rộng (Speed Dial): mặc định chỉ là 1 nút (+) — bấm vào mới hiện 2 lựa chọn
 * hành động nhỏ phía trên (Check-in / Wishlist), có animation fade+scale từng nút,
 * bấm ra ngoài hoặc bấm lại (+) để thu gọn. Đúng nguyên tắc Progressive Disclosure.
 */
export function SpeedDialFab({ onCheckin, onWishlist, className }: SpeedDialFabProps) {
  const [open, setOpen] = useState(false);

  function handleAction(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <div className={cn('fixed bottom-24 right-5 z-30 flex flex-col items-end gap-3 lg:bottom-8', className)}>
      {open && (
        <>
          <button
            onClick={() => handleAction(onWishlist)}
            className="animate-fade-in flex items-center gap-2 rounded-full bg-card py-2 pl-4 pr-2 text-sm font-medium shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5"
          >
            Thêm Wishlist
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
              <Star className="h-4 w-4" />
            </span>
          </button>
          <button
            onClick={() => handleAction(onCheckin)}
            className="animate-fade-in flex items-center gap-2 rounded-full bg-card py-2 pl-4 pr-2 text-sm font-medium shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5"
          >
            Check-in
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" />
            </span>
          </button>
        </>
      )}

      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="fixed inset-0 -z-10 cursor-default bg-black/10 backdrop-blur-[1px]"
          aria-label="Đóng"
          tabIndex={-1}
        />
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Đóng' : 'Thêm mới'}
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:h-14 hover:w-16 hover:rounded-[28px] hover:brightness-105 active:scale-95"
      >
        {open ? (
          <X className="h-6 w-6 transition-transform duration-200" />
        ) : (
          <Plus className="h-7 w-7 transition-transform duration-200 group-hover:rotate-90" strokeWidth={2.4} />
        )}
      </button>
    </div>
  );
}
