'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface PendingPhotoGridProps {
  files: File[];
  onRemove: (index: number) => void;
}

/**
 * Khác với PhotoGrid (dùng cho ảnh đã có trong Dexie), component này chỉ preview
 * File objects tạm thời trong bộ nhớ — ảnh thật sự chỉ được nén + ghi vào IndexedDB
 * SAU KHI người dùng bấm "Lưu check-in" và địa điểm đã có id (xem checkin-sheet.tsx).
 */
export function PendingPhotoGrid({ files, onRemove }: PendingPhotoGridProps) {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    const nextUrls = files.map((f) => URL.createObjectURL(f));
    setUrls(nextUrls);
    return () => nextUrls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  if (files.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-2">
      {urls.map((url, i) => (
        <div key={url} className="relative aspect-square overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element -- preview từ blob URL tạm thời */}
          <img src={url} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            aria-label="Xoá ảnh"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
