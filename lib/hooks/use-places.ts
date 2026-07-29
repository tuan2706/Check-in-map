import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import type { PlaceWithRelations } from '@/types';

/**
 * useLiveQuery tự động re-run và re-render khi bất kỳ bảng nào nó đọc bị thay đổi
 * (ví dụ sau khi createPlace) — không cần tự quản lý cache/invalidate như React Query.
 * Trả về undefined trong lúc đang tải lần đầu, mảng rỗng nếu không có dữ liệu.
 */
export function usePlaces(): PlaceWithRelations[] | undefined {
  return useLiveQuery(async () => {
    const places = await db.places.orderBy('checkinDate').reverse().toArray();

    const results: PlaceWithRelations[] = await Promise.all(
      places.map(async (place) => {
        const placeTags = await db.placeTags.where('placeId').equals(place.id as number).toArray();
        const tags = await db.tags.bulkGet(placeTags.map((pt) => pt.tagId));
        const imageCount = await db.images.where('placeId').equals(place.id as number).count();

        return {
          ...place,
          tags: tags.filter((t): t is NonNullable<typeof t> => Boolean(t)),
          imageCount,
        };
      })
    );

    return results;
  }, []);
}

export function usePlace(id: number | undefined): PlaceWithRelations | undefined {
  return useLiveQuery(async () => {
    if (id === undefined) return undefined;
    const place = await db.places.get(id);
    if (!place) return undefined;

    const placeTags = await db.placeTags.where('placeId').equals(id).toArray();
    const tags = await db.tags.bulkGet(placeTags.map((pt) => pt.tagId));
    const imageCount = await db.images.where('placeId').equals(id).count();

    return {
      ...place,
      tags: tags.filter((t): t is NonNullable<typeof t> => Boolean(t)),
      imageCount,
    };
  }, [id]);
}
