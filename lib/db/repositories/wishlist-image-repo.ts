import { db } from '@/lib/db/schema';
import { compressImage, generateThumbnail } from '@/lib/image/compress';

export async function addWishlistImage(wishlistPlaceId: number, file: File): Promise<number> {
  const [blob, thumbnailBlob] = await Promise.all([compressImage(file), generateThumbnail(file)]);

  const currentMax = await db.wishlistImages
    .where('wishlistPlaceId')
    .equals(wishlistPlaceId)
    .toArray()
    .then((imgs) => imgs.reduce((max, img) => Math.max(max, img.order), -1));

  const id = await db.wishlistImages.add({
    wishlistPlaceId,
    blob,
    thumbnailBlob,
    order: currentMax + 1,
    createdAt: Date.now(),
  });

  const item = await db.wishlistPlaces.get(wishlistPlaceId);
  if (item && !item.coverImageId) {
    await db.wishlistPlaces.update(wishlistPlaceId, { coverImageId: id });
  }

  return id;
}

export async function addWishlistImages(wishlistPlaceId: number, files: File[]): Promise<number[]> {
  const ids: number[] = [];
  for (const file of files) {
    ids.push(await addWishlistImage(wishlistPlaceId, file));
  }
  return ids;
}

export async function deleteWishlistImage(imageId: number, wishlistPlaceId: number): Promise<void> {
  await db.wishlistImages.delete(imageId);

  const item = await db.wishlistPlaces.get(wishlistPlaceId);
  if (item?.coverImageId === imageId) {
    const remaining = await db.wishlistImages.where('wishlistPlaceId').equals(wishlistPlaceId).sortBy('order');
    await db.wishlistPlaces.update(wishlistPlaceId, { coverImageId: remaining[0]?.id });
  }
}

export async function setWishlistCoverImage(wishlistPlaceId: number, imageId: number): Promise<void> {
  await db.wishlistPlaces.update(wishlistPlaceId, { coverImageId: imageId });
}

export async function reorderWishlistImages(orderedIds: number[]): Promise<void> {
  await db.transaction('rw', db.wishlistImages, async () => {
    await Promise.all(orderedIds.map((id, index) => db.wishlistImages.update(id, { order: index })));
  });
}
