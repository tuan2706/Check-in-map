import type { Category } from '@/types';
import { db } from './schema';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', label: 'Ăn uống', emoji: '🍜', color: '#f97316' },
  { id: 'cafe', label: 'Cafe', emoji: '☕', color: '#a16207' },
  { id: 'pub', label: 'Quán nhậu', emoji: '🍺', color: '#ca8a04' },
  { id: 'bar', label: 'Bar', emoji: '🍹', color: '#c026d3' },
  { id: 'hotel', label: 'Khách sạn', emoji: '🏨', color: '#0891b2' },
  { id: 'homestay', label: 'Homestay', emoji: '🏠', color: '#0d9488' },
  { id: 'travel', label: 'Du lịch', emoji: '✈️', color: '#2563eb' },
  { id: 'resort', label: 'Resort', emoji: '🏝', color: '#0ea5e9' },
  { id: 'amusement', label: 'Khu vui chơi', emoji: '🎡', color: '#db2777' },
  { id: 'camping', label: 'Camping', emoji: '🏕', color: '#15803d' },
  { id: 'cinema', label: 'Rạp phim', emoji: '🎬', color: '#7c3aed' },
  { id: 'mall', label: 'Trung tâm thương mại', emoji: '🛍', color: '#e11d48' },
  { id: 'service', label: 'Dịch vụ', emoji: '🏥', color: '#059669' },
  { id: 'beach', label: 'Bãi biển', emoji: '🏖', color: '#0284c7' },
  { id: 'park', label: 'Công viên', emoji: '🏞', color: '#16a34a' },
  { id: 'checkin_spot', label: 'Điểm check-in', emoji: '📸', color: '#9333ea' },
  { id: 'rest_stop', label: 'Trạm dừng', emoji: '🚗', color: '#64748b' },
  { id: 'gas_station', label: 'Cây xăng', emoji: '⛽', color: '#dc2626' },
  { id: 'supermarket', label: 'Siêu thị', emoji: '🛒', color: '#ea580c' },
  { id: 'other', label: 'Khác', emoji: '📍', color: '#6b7280' },
];

/**
 * Seed dữ liệu mặc định — chạy an toàn nhiều lần (idempotent),
 * chỉ ghi nếu bảng categories đang rỗng.
 */
export async function seedDefaultData() {
  const count = await db.categories.count();
  if (count === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  }

  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      theme: 'system',
      mapStyle: 'streets',
    });
  }
}
