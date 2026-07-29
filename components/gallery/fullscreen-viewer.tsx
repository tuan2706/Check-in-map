'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';

interface FullscreenViewerProps {
  imageUrls: string[];
  initialIndex: number;
  onClose: () => void;
}

const ZOOM_STEP = 0.5;
const MAX_ZOOM = 4;
const MIN_ZOOM = 1;

export function FullscreenViewer({ imageUrls, initialIndex, onClose }: FullscreenViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => setZoom(1), [index]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, imageUrls.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [imageUrls.length, onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/95">
      {/* Thanh công cụ trên cùng */}
      <div className="flex items-center justify-between p-4">
        <span className="font-mono text-xs text-white/70">
          {index + 1} / {imageUrls.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
            aria-label="Thu nhỏ"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
            aria-label="Phóng to"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Ảnh chính, cuộn chuột để zoom nhanh */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-4"
        onWheel={(e) => {
          const delta = e.deltaY > 0 ? -0.2 : 0.2;
          setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
        }}
      >
        {imageUrls.length > 1 && index > 0 && (
          <button
            type="button"
            onClick={() => setIndex((i) => i - 1)}
            className="absolute left-3 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            aria-label="Ảnh trước"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh từ Blob URL, next/image không hỗ trợ trực tiếp */}
        <img
          src={imageUrls[index]}
          alt=""
          className="max-h-full max-w-full select-none object-contain transition-transform duration-[250ms] ease-out"
          style={{ transform: `scale(${zoom})` }}
          onDoubleClick={() => setZoom((z) => (z === 1 ? 2 : 1))}
          draggable={false}
        />

        {imageUrls.length > 1 && index < imageUrls.length - 1 && (
          <button
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            className="absolute right-3 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            aria-label="Ảnh sau"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}
