import { db } from '@/lib/db/schema';

interface BackupImage {
  id: number;
  placeId: number;
  order: number;
  createdAt: number;
  blobBase64: string;
  thumbnailBase64: string;
}

interface BackupWishlistImage {
  id: number;
  wishlistPlaceId: number;
  order: number;
  createdAt: number;
  blobBase64: string;
  thumbnailBase64: string;
}

interface BackupFile {
  version: 1 | 2;
  exportedAt: string;
  places: unknown[];
  images: BackupImage[];
  tags: unknown[];
  placeTags: unknown[];
  categories: unknown[];
  settings: unknown[];
  // Thêm ở version 2 (Wishlist) — có thể vắng mặt nếu import file backup cũ (version 1)
  wishlistPlaces?: unknown[];
  wishlistImages?: BackupWishlistImage[];
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function base64ToBlob(base64: string): Promise<Blob> {
  const res = await fetch(base64);
  return res.blob();
}

/**
 * Xuất toàn bộ dữ liệu ra 1 file JSON — bao gồm cả check-in VÀ Wishlist (từ Version 2),
 * kèm ảnh (chuyển Blob -> base64 vì JSON không lưu được binary trực tiếp).
 */
export async function exportAllData(): Promise<Blob> {
  const [places, images, tags, placeTags, categories, settings, wishlistPlaces, wishlistImages] =
    await Promise.all([
      db.places.toArray(),
      db.images.toArray(),
      db.tags.toArray(),
      db.placeTags.toArray(),
      db.categories.toArray(),
      db.settings.toArray(),
      db.wishlistPlaces.toArray(),
      db.wishlistImages.toArray(),
    ]);

  const [imagesWithBase64, wishlistImagesWithBase64] = await Promise.all([
    Promise.all(
      images.map(async (img) => ({
        id: img.id as number,
        placeId: img.placeId,
        order: img.order,
        createdAt: img.createdAt,
        blobBase64: await blobToBase64(img.blob),
        thumbnailBase64: await blobToBase64(img.thumbnailBlob),
      }))
    ),
    Promise.all(
      wishlistImages.map(async (img) => ({
        id: img.id as number,
        wishlistPlaceId: img.wishlistPlaceId,
        order: img.order,
        createdAt: img.createdAt,
        blobBase64: await blobToBase64(img.blob),
        thumbnailBase64: await blobToBase64(img.thumbnailBlob),
      }))
    ),
  ]);

  const backup: BackupFile = {
    version: 2,
    exportedAt: new Date().toISOString(),
    places,
    images: imagesWithBase64,
    tags,
    placeTags,
    categories,
    settings,
    wishlistPlaces,
    wishlistImages: wishlistImagesWithBase64,
  };

  return new Blob([JSON.stringify(backup)], { type: 'application/json' });
}

export function downloadBackup(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my-checkin-map-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Khôi phục dữ liệu từ file backup — GHI ĐÈ toàn bộ dữ liệu hiện tại.
 * Hỗ trợ cả file backup cũ (version 1, chưa có Wishlist) lẫn mới (version 2).
 */
export async function importAllData(file: File): Promise<void> {
  const text = await file.text();
  const backup = JSON.parse(text) as BackupFile;

  if (backup.version !== 1 && backup.version !== 2) {
    throw new Error('Định dạng file backup không được hỗ trợ');
  }

  await db.transaction(
    'rw',
    [db.places, db.images, db.tags, db.placeTags, db.categories, db.settings, db.wishlistPlaces, db.wishlistImages],
    async () => {
      await Promise.all([
        db.places.clear(),
        db.images.clear(),
        db.tags.clear(),
        db.placeTags.clear(),
        db.categories.clear(),
        db.settings.clear(),
        db.wishlistPlaces.clear(),
        db.wishlistImages.clear(),
      ]);

      await db.places.bulkAdd(backup.places as never[]);
      await db.tags.bulkAdd(backup.tags as never[]);
      await db.placeTags.bulkAdd(backup.placeTags as never[]);
      await db.categories.bulkAdd(backup.categories as never[]);
      await db.settings.bulkAdd(backup.settings as never[]);

      const restoredImages = await Promise.all(
        backup.images.map(async (img) => ({
          id: img.id,
          placeId: img.placeId,
          order: img.order,
          createdAt: img.createdAt,
          blob: await base64ToBlob(img.blobBase64),
          thumbnailBlob: await base64ToBlob(img.thumbnailBase64),
        }))
      );
      await db.images.bulkAdd(restoredImages);

      // Wishlist chỉ có ở file backup version 2 trở lên
      if (backup.wishlistPlaces?.length) {
        await db.wishlistPlaces.bulkAdd(backup.wishlistPlaces as never[]);
      }
      if (backup.wishlistImages?.length) {
        const restoredWishlistImages = await Promise.all(
          backup.wishlistImages.map(async (img) => ({
            id: img.id,
            wishlistPlaceId: img.wishlistPlaceId,
            order: img.order,
            createdAt: img.createdAt,
            blob: await base64ToBlob(img.blobBase64),
            thumbnailBlob: await base64ToBlob(img.thumbnailBase64),
          }))
        );
        await db.wishlistImages.bulkAdd(restoredWishlistImages);
      }
    }
  );
}
