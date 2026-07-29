import { db } from '@/lib/db/schema';
import { compressImage, generateThumbnail } from '@/lib/image/compress';

/** Nén 1 file ảnh và lưu vào bảng images, gắn với placeId. Trả về id ảnh mới. */
export async function addImage(placeId: number, file: File): Promise<number> {
  const [blob, thumbnailBlob] = await Promise.all([compressImage(file), generateThumbnail(file)]);

  const currentMax = await db.images
    .where('placeId')
    .equals(placeId)
    .toArray()
    .then((imgs) => imgs.reduce((max, img) => Math.max(max, img.order), -1));

  const id = await db.images.add({
    placeId,
    blob,
    thumbnailBlob,
    order: currentMax + 1,
    createdAt: Date.now(),
  });

  // Nếu đây là ảnh đầu tiên của địa điểm, tự động đặt làm ảnh bìa
  const place = await db.places.get(placeId);
  if (place && !place.coverImageId) {
    await db.places.update(placeId, { coverImageId: id });
  }

  return id;
}

/** Nén và lưu nhiều ảnh tuần tự (tránh spike CPU khi nén hàng chục ảnh cùng lúc) */
export async function addImages(placeId: number, files: File[]): Promise<number[]> {
  const ids: number[] = [];
  for (const file of files) {
    ids.push(await addImage(placeId, file));
  }
  return ids;
}

export async function deleteImage(imageId: number, placeId: number): Promise<void> {
  await db.images.delete(imageId);

  // Nếu ảnh vừa xoá là ảnh bìa, tự động chọn ảnh còn lại đầu tiên làm bìa mới (nếu có)
  const place = await db.places.get(placeId);
  if (place?.coverImageId === imageId) {
    const remaining = await db.images.where('placeId').equals(placeId).sortBy('order');
    await db.places.update(placeId, { coverImageId: remaining[0]?.id });
  }
}

export async function setCoverImage(placeId: number, imageId: number): Promise<void> {
  await db.places.update(placeId, { coverImageId: imageId });
}

/** Cập nhật lại thứ tự ảnh sau khi người dùng kéo-thả sắp xếp */
export async function reorderImages(orderedIds: number[]): Promise<void> {
  await db.transaction('rw', db.images, async () => {
    await Promise.all(orderedIds.map((id, index) => db.images.update(id, { order: index })));
  });
}

export async function getImagesForPlace(placeId: number) {
  return db.images.where('placeId').equals(placeId).sortBy('order');
}
