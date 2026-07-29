import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import type { PlaceImageWithUrl } from '@/lib/hooks/use-images';

export function useWishlistImages(wishlistPlaceId: number | undefined): PlaceImageWithUrl[] {
  const rawImages = useLiveQuery(async () => {
    if (wishlistPlaceId === undefined) return [];
    return db.wishlistImages.where('wishlistPlaceId').equals(wishlistPlaceId).sortBy('order');
  }, [wishlistPlaceId]);

  const [images, setImages] = useState<PlaceImageWithUrl[]>([]);

  useEffect(() => {
    if (!rawImages) return;

    const withUrls = rawImages.map((img) => ({
      id: img.id as number,
      placeId: img.wishlistPlaceId,
      order: img.order,
      url: URL.createObjectURL(img.blob),
      thumbnailUrl: URL.createObjectURL(img.thumbnailBlob),
    }));

    setImages(withUrls);
    return () => {
      withUrls.forEach((img) => {
        URL.revokeObjectURL(img.url);
        URL.revokeObjectURL(img.thumbnailUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawImages]);

  return images;
}
