import { db } from '@/lib/db/schema';
import { createPlace, type NewPlaceInput } from '@/lib/db/repositories/place-repo';
import type { Rating, WishlistPlace } from '@/types';

export type NewWishlistInput = Omit<
  WishlistPlace,
  'id' | 'addedAt' | 'updatedAt' | 'isConverted' | 'convertedPlaceId'
>;

export async function createWishlistItem(input: NewWishlistInput): Promise<number> {
  const now = Date.now();
  return db.wishlistPlaces.add({
    ...input,
    addedAt: now,
    updatedAt: now,
    isConverted: false,
  });
}

export async function updateWishlistItem(id: number, changes: Partial<WishlistPlace>) {
  return db.wishlistPlaces.update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteWishlistItem(id: number) {
  return db.transaction('rw', db.wishlistPlaces, db.wishlistImages, async () => {
    await db.wishlistImages.where('wishlistPlaceId').equals(id).delete();
    await db.wishlistPlaces.delete(id);
  });
}

/** Dữ liệu bổ sung khi chuyển 1 mục Wishlist thành check-in thật */
export interface ConvertToCheckinInput {
  rating: Rating;
  reviewText?: string;
  checkinDate: string;
  checkinTime?: string;
  actualCost?: number;
  wouldReturn: boolean;
  wouldRecommend: boolean;
}

/**
 * Chuyển 1 địa điểm Wishlist thành Place (check-in) thật:
 * - Giữ nguyên tên, danh mục, địa chỉ, GPS, link Google Maps, tag, ghi chú đã có
 * - Bổ sung rating/review/ngày check-in/chi phí thực tế (input mới từ form rút gọn)
 * - Copy toàn bộ ảnh đã có trong Wishlist sang địa điểm mới (không bắt chụp lại)
 * - Đánh dấu wishlist item là "đã chuyển đổi" (ẩn khỏi tab Muốn đi) thay vì xoá,
 *   để vẫn giữ được lịch sử "nơi này từng nằm trong wishlist bao lâu".
 */
export async function convertWishlistToCheckin(
  wishlistId: number,
  extra: ConvertToCheckinInput
): Promise<number> {
  const wishlistItem = await db.wishlistPlaces.get(wishlistId);
  if (!wishlistItem) throw new Error('Không tìm thấy mục Wishlist này');
  if (wishlistItem.lat === undefined || wishlistItem.lng === undefined) {
    throw new Error('Địa điểm này chưa có toạ độ GPS, hãy bổ sung trước khi check-in');
  }

  const newPlaceInput: NewPlaceInput = {
    name: wishlistItem.name,
    categoryId: wishlistItem.categoryId,
    address: wishlistItem.address,
    lat: wishlistItem.lat,
    lng: wishlistItem.lng,
    checkinDate: extra.checkinDate,
    checkinTime: extra.checkinTime,
    rating: extra.rating,
    reviewText: extra.reviewText,
    recommendedDish: undefined,
    priceRange: undefined,
    weather: undefined,
    wouldReturn: extra.wouldReturn,
    wouldRecommend: extra.wouldRecommend,
    googleMapsUrl: wishlistItem.googleMapsUrl,
    website: undefined,
    facebook: undefined,
    instagram: undefined,
    companions: undefined,
    cost: extra.actualCost,
    notes: wishlistItem.notes,
    tagNames: wishlistItem.tagNames,
  };

  const newPlaceId = await createPlace(newPlaceInput);

  // Copy ảnh cũ từ wishlist sang bảng images của check-in (giữ nguyên Blob, không nén lại)
  const oldImages = await db.wishlistImages.where('wishlistPlaceId').equals(wishlistId).sortBy('order');
  for (const img of oldImages) {
    const newImageId = await db.images.add({
      placeId: newPlaceId,
      blob: img.blob,
      thumbnailBlob: img.thumbnailBlob,
      order: img.order,
      createdAt: img.createdAt,
    });
    if (img.id === wishlistItem.coverImageId) {
      await db.places.update(newPlaceId, { coverImageId: newImageId });
    }
  }
  // Nếu wishlist chưa có ảnh bìa nhưng có ít nhất 1 ảnh, đặt ảnh đầu tiên làm bìa
  if (!wishlistItem.coverImageId && oldImages.length > 0) {
    const firstNew = await db.images.where('placeId').equals(newPlaceId).sortBy('order');
    if (firstNew[0]) await db.places.update(newPlaceId, { coverImageId: firstNew[0].id });
  }

  await db.wishlistPlaces.update(wishlistId, {
    isConverted: true,
    convertedPlaceId: newPlaceId,
    updatedAt: Date.now(),
  });

  return newPlaceId;
}
