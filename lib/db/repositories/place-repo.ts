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

/**
 * Cập nhật địa điểm KÈM tag — dùng cho tính năng Edit vì tag không nằm trực tiếp
 * trên record Place mà qua bảng trung gian placeTags. Cách đơn giản và an toàn nhất:
 * xoá hết tag cũ của địa điểm này rồi gắn lại theo danh sách tag mới.
 */
export async function updatePlaceWithTags(
  id: number,
  changes: Partial<Place>,
  tagNames: string[]
): Promise<void> {
  await db.transaction('rw', db.places, db.tags, db.placeTags, async () => {
    await db.places.update(id, { ...changes, updatedAt: Date.now() });
    await db.placeTags.where('placeId').equals(id).delete();
    for (const rawTag of tagNames) {
      if (!rawTag.trim()) continue;
      const tagId = await findOrCreateTag(rawTag);
      await db.placeTags.add({ placeId: id, tagId });
    }
  });
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
