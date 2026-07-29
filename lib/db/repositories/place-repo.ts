import { db } from '@/lib/db/schema';
import { findOrCreateTag } from '@/lib/db/repositories/tag-repo';
import type { Place } from '@/types';

export type NewPlaceInput = Omit<Place, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'> & {
  tagNames?: string[];
};

/**
 * Tạo mới 1 địa điểm + gắn danh sách tag (tự tạo tag nếu chưa tồn tại).
 * Dùng transaction để đảm bảo place + placeTags được ghi cùng lúc, tránh dữ liệu mồ côi
 * nếu có lỗi giữa chừng.
 */
export async function createPlace(input: NewPlaceInput): Promise<number> {
  const { tagNames = [], ...placeData } = input;
  const now = Date.now();

  return db.transaction('rw', db.places, db.tags, db.placeTags, async () => {
    const placeId = await db.places.add({
      ...placeData,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    });

    for (const rawTag of tagNames) {
      if (!rawTag.trim()) continue;
      const tagId = await findOrCreateTag(rawTag);
      await db.placeTags.add({ placeId, tagId });
    }

    return placeId;
  });
}

export async function updatePlace(id: number, changes: Partial<Place>) {
  return db.places.update(id, { ...changes, updatedAt: Date.now() });
}

export async function deletePlace(id: number) {
  return db.transaction('rw', db.places, db.images, db.placeTags, async () => {
    await db.images.where('placeId').equals(id).delete();
    await db.placeTags.where('placeId').equals(id).delete();
    await db.places.delete(id);
  });
}

export async function toggleFavorite(id: number, current: boolean) {
  return db.places.update(id, { isFavorite: !current, updatedAt: Date.now() });
}
