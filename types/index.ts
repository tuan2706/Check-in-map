export type Rating = 1 | 2 | 3 | 4 | 5;

export type CategoryId =
  | 'food'
  | 'cafe'
  | 'pub'
  | 'bar'
  | 'hotel'
  | 'homestay'
  | 'travel'
  | 'resort'
  | 'amusement'
  | 'camping'
  | 'cinema'
  | 'mall'
  | 'service'
  | 'beach'
  | 'park'
  | 'checkin_spot'
  | 'rest_stop'
  | 'gas_station'
  | 'supermarket'
  | 'other';

export interface Place {
  id?: number;
  name: string;
  categoryId: CategoryId;
  address?: string;
  lat: number;
  lng: number;
  checkinDate: string; // ISO date yyyy-MM-dd
  checkinTime?: string; // HH:mm
  rating: Rating;
  reviewText?: string;
  recommendedDish?: string;
  priceRange?: string;
  weather?: string;
  wouldReturn: boolean;
  wouldRecommend: boolean;
  googleMapsUrl?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  companions?: string;
  cost?: number;
  notes?: string;
  coverImageId?: number;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PlaceImage {
  id?: number;
  placeId: number;
  blob: Blob;
  thumbnailBlob: Blob;
  order: number;
  createdAt: number;
}

export interface Tag {
  id?: number;
  name: string;
}

export interface PlaceTag {
  id?: number;
  placeId: number;
  tagId: number;
}

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
}

export interface AppSettings {
  id?: number;
  theme: 'light' | 'dark' | 'system';
  mapStyle: 'streets' | 'satellite';
  lastBackupAt?: number;

  // Version 4 — các field mới đều optional để không ảnh hưởng dữ liệu settings cũ
  nearMeDefaultRadiusKm?: number;
  homeWidgetRadiusKm?: number;

  passingByEnabled?: boolean;
  passingByRadiusM?: number;
  passingByDailyLimit?: number;
  passingByShownDate?: string; // yyyy-MM-dd — để reset đếm số lần hiển thị mỗi ngày
  passingByShownCount?: number;
  passingByHiddenUntil?: number; // timestamp — "tạm ẩn hôm nay"

  mascotEnabled?: boolean;
  mascotFrequency?: 'low' | 'medium' | 'high';
}

/** Kiểu dữ liệu Place kèm quan hệ đã join sẵn, dùng cho UI */
export interface PlaceWithRelations extends Place {
  tags: Tag[];
  coverThumbnailUrl?: string;
  imageCount: number;
}

// ============================================================
// WISHLIST — Version 2. Bảng hoàn toàn mới, không đụng vào
// Place/PlaceImage ở trên, nên dữ liệu check-in cũ không bị ảnh hưởng.
// ============================================================

export type WishlistPriority = 'high' | 'medium' | 'low';

export type WishlistSource = 'facebook' | 'tiktok' | 'friend' | 'google' | 'other';

export interface WishlistPlace {
  id?: number;
  name: string;
  categoryId: CategoryId;
  address?: string;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
  source?: WishlistSource;
  priority: WishlistPriority;
  notes?: string;
  estimatedCost?: number;
  /** Wishlist dùng tag dạng chuỗi đơn giản (không chuẩn hoá qua bảng Tag như Place)
   *  vì đây là dữ liệu "nháp", chưa cần liên kết chặt như check-in thật. */
  tagNames: string[];
  addedAt: number;
  updatedAt: number;
  /** true khi đã bấm "Đã trải nghiệm" -> chuyển thành Place thật, ẩn khỏi tab Wishlist */
  isConverted: boolean;
  convertedPlaceId?: number;
  coverImageId?: number;
}

export interface WishlistImage {
  id?: number;
  wishlistPlaceId: number;
  blob: Blob;
  thumbnailBlob: Blob;
  order: number;
  createdAt: number;
}

export interface WishlistPlaceWithMeta extends WishlistPlace {
  imageCount: number;
}

// ============================================================
// RANDOM DISCOVERY ("Hôm nay đi đâu?") — Version 3
// ============================================================

export type RandomSource = 'wishlist' | 'visited' | 'not_visited' | 'all';

export interface RandomFilters {
  source: RandomSource;
  categoryIds: CategoryId[];
  maxDistanceKm: number | null; // null = không giới hạn
  minBudget: number | null;
  maxBudget: number | null;
  priority: WishlistPriority | null; // chỉ áp dụng khi source liên quan Wishlist
  minRating: number | null; // chỉ áp dụng khi source liên quan địa điểm đã ghé
  wouldReturnOnly: boolean;
}

/** 1 mục có thể được random tới — gộp chung Place và WishlistPlace về 1 hình dạng thống nhất */
export interface RandomCandidate {
  kind: 'place' | 'wishlist';
  id: number;
  name: string;
  categoryId: CategoryId;
  address?: string;
  lat?: number;
  lng?: number;
  coverImageId?: number;
  rating?: Rating;
  priority?: WishlistPriority;
  cost?: number;
  googleMapsUrl?: string;
  addedOrCheckedInAt: number; // timestamp để tính "đã lưu từ X tháng trước"
  wouldReturn?: boolean;
  isFavorite?: boolean;
}

export interface SpinHistoryEntry {
  id?: number;
  candidateKind: 'place' | 'wishlist';
  candidateId: number;
  spunAt: number;
}
