import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import type { WishlistPlaceWithMeta } from '@/types';

export function useWishlist(): WishlistPlaceWithMeta[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.wishlistPlaces.toArray();
    const items = all.filter((item) => !item.isConverted);

    return Promise.all(
      items.map(async (item) => ({
        ...item,
        imageCount: await db.wishlistImages.where('wishlistPlaceId').equals(item.id as number).count(),
      }))
    );
  }, []);
}

export function useWishlistItem(id: number | undefined) {
  return useLiveQuery(async () => {
    if (id === undefined) return undefined;
    return db.wishlistPlaces.get(id);
  }, [id]);
}
