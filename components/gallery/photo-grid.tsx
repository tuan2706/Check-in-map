'use client';

import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { deleteImage, reorderImages, setCoverImage } from '@/lib/db/repositories/image-repo';
import { FullscreenViewer } from '@/components/gallery/fullscreen-viewer';
import type { PlaceImageWithUrl } from '@/lib/hooks/use-images';

interface PhotoGridProps {
  placeId: number;
  images: PlaceImageWithUrl[];
  coverImageId?: number;
}

export function PhotoGrid({ placeId, images, coverImageId }: PhotoGridProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);

  async function handleDrop(targetId: number) {
    if (dragId === null || dragId === targetId) return;
    const ids = images.map((i) => i.id);
    const fromIndex = ids.indexOf(dragId);
    const toIndex = ids.indexOf(targetId);
    ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, dragId);
    await reorderImages(ids);
    setDragId(null);
  }

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((img, i) => (
          <div
            key={img.id}
            draggable
            onDragStart={() => setDragId(img.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(img.id)}
            className={cn(
              'group relative aspect-square cursor-grab overflow-hidden rounded-xl border border-border bg-muted active:cursor-grabbing',
              dragId === img.id && 'opacity-40'
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh từ Blob URL trong IndexedDB */}
            <img
              src={img.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
              onClick={() => setViewerIndex(i)}
            />

            {img.id === coverImageId && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground">
                Bìa
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setCoverImage(placeId, img.id)}
                className="rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                aria-label="Đặt làm ảnh bìa"
              >
                <Star className="h-3.5 w-3.5" fill={img.id === coverImageId ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                onClick={() => deleteImage(img.id, placeId)}
                className="rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                aria-label="Xoá ảnh"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {viewerIndex !== null && (
        <FullscreenViewer
          imageUrls={images.map((i) => i.url)}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
}
