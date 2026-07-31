import Dexie, { type Table } from 'dexie';
import type {
  AppSettings,
  Category,
  Place,
  PlaceImage,
  PlaceTag,
  SpinHistoryEntry,
  Tag,
  WishlistImage,
  WishlistPlace,
} from '@/types';

/**
 * CheckinMapDB — toàn bộ dữ liệu app sống ở đây, trong IndexedDB của trình duyệt.
 *
 * Lưu ý index (chuỗi trong .stores()):
 * - '++id' -> khoá chính tự tăng
 * - '&name' -> unique index (không cho trùng tên tag)
 * - các field còn lại là index thường, dùng để filter/sort nhanh mà không phải quét toàn bộ bảng
 */
class CheckinMapDB extends Dexie {
  places!: Table<Place, number>;
  images!: Table<PlaceImage, number>;
  tags!: Table<Tag, number>;
  placeTags!: Table<PlaceTag, number>;
  categories!: Table<Category, string>;
  settings!: Table<AppSettings, number>;
  // Version 2 — Wishlist
  wishlistPlaces!: Table<WishlistPlace, number>;
  wishlistImages!: Table<WishlistImage, number>;
  // Version 3 — Random Discovery
  spinHistory!: Table<SpinHistoryEntry, number>;

  constructor() {
    super('CheckinMapDB');

    this.version(1).stores({
      places:
        '++id, categoryId, checkinDate, rating, isFavorite, wouldReturn, wouldRecommend, [lat+lng]',
      images: '++id, placeId, order',
      tags: '++id, &name',
      placeTags: '++id, placeId, tagId',
      categories: 'id',
      settings: '++id',
    });

    // Version 2: chỉ THÊM 2 bảng mới cho Wishlist. Dexie sẽ tự giữ nguyên toàn bộ
    // dữ liệu ở các bảng cũ (places/images/tags/...) — không cần liệt kê lại chúng
    // ở đây, chỉ khai báo phần thay đổi/thêm mới.
    this.version(2).stores({
      wishlistPlaces: '++id, categoryId, priority, addedAt',
      wishlistImages: '++id, wishlistPlaceId, order',
    });

    // Version 3: thêm bảng lưu lịch sử "quay số" (Random Discovery) — dùng để
    // tránh gợi ý lặp lại địa điểm vừa random gần đây, và hiển thị "Tuần này đã đi đâu".
    this.version(3).stores({
      spinHistory: '++id, candidateKind, candidateId, spunAt',
    });
  }
}

export const db = new CheckinMapDB();

/**
 * Gọi 1 lần khi app khởi động (xem lib/db/seed.ts) để:
 * 1. Seed sẵn danh mục mặc định nếu bảng categories rỗng
 * 2. Xin quyền lưu trữ bền vững, tránh trình duyệt tự xoá dữ liệu khi thiếu bộ nhớ
 */
export async function initPersistentStorage() {
  if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
    const isPersisted = await navigator.storage.persisted();
    if (!isPersisted) {
      await navigator.storage.persist();
    }
  }
}
