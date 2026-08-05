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
  /** Chỉ cần truyền khi Wishlist gốc chưa có GPS — sẽ được lưu ngược lại vào Wishlist */
  lat?: number;
  lng?: number;
}

export interface ConvertResult {
  placeId: number;
  /** Số ngày từ lúc thêm vào Wishlist tới lúc check-in — phục vụ Timeline/thống kê */
  waitingDays: number;
}

/**
 * Chuyển 1 địa điểm Wishlist thành Place (check-in) thật:
 * - Giữ nguyên tên, danh mục, địa chỉ, GPS, link Google Maps, tag, ghi chú đã có
 * - Bổ sung rating/review/ngày check-in/chi phí thực tế (input mới từ form rút gọn)
 * - Nếu Wishlist gốc CHƯA có GPS, dùng toạ độ vừa nhập ở bước này (đã lưu ngược lại
 *   vào Wishlist trước, không chặn cứng như trước đây)
 * - Copy toàn bộ ảnh đã có trong Wishlist sang địa điểm mới (không bắt chụp lại)
 * - Đánh dấu wishlist item là "đã chuyển đổi" (ẩn khỏi tab Muốn đi) thay vì xoá,
 *   để vẫn giữ được lịch sử "nơi này từng nằm trong wishlist bao lâu".
 */
export async function convertWishlistToCheckin(
  wishlistId: number,
  extra: ConvertToCheckinInput
): Promise<ConvertResult> {
  const wishlistItem = await db.wishlistPlaces.get(wishlistId);
  if (!wishlistItem) throw new Error('Không tìm thấy mục Wishlist này');

  const finalLat = wishlistItem.lat ?? extra.lat;
  const finalLng = wishlistItem.lng ?? extra.lng;
  if (finalLat === undefined || finalLng === undefined) {
    throw new Error('Cần có toạ độ GPS để hoàn tất check-in — vui lòng bổ sung vị trí');
  }

  // Nếu Wishlist gốc chưa có GPS, lưu ngược lại luôn để không phải hỏi lại lần sau
  if (wishlistItem.lat === undefined || wishlistItem.lng === undefined) {
    await db.wishlistPlaces.update(wishlistId, { lat: finalLat, lng: finalLng });
  }

  const newPlaceInput: NewPlaceInput = {
    name: wishlistItem.name,
    categoryId: wishlistItem.categoryId,
    address: wishlistItem.address,
    lat: finalLat,
    lng: finalLng,
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
    const firstImage = firstNew[0];
    if (firstImage) await db.places.update(newPlaceId, { coverImageId: firstImage.id });
  }

  await db.wishlistPlaces.update(wishlistId, {
    isConverted: true,
    convertedPlaceId: newPlaceId,
    updatedAt: Date.now(),
  });

  const checkinTimestamp = new Date(extra.checkinDate).getTime() || Date.now();
  const waitingDays = Math.max(0, Math.round((checkinTimestamp - wishlistItem.addedAt) / (1000 * 60 * 60 * 24)));

  return { placeId: newPlaceId, waitingDays };
}
