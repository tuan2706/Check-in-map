import type { RandomFilters } from '@/types';

export const DEFAULT_RANDOM_FILTERS: RandomFilters = {
  source: 'all',
  categoryIds: [],
  maxDistanceKm: null,
  minBudget: null,
  maxBudget: null,
  priority: null,
  minRating: null,
  wouldReturnOnly: false,
};

export const DISTANCE_OPTIONS: { value: number | null; label: string }[] = [
  { value: 2, label: 'Trong 2km' },
  { value: 5, label: 'Trong 5km' },
  { value: 10, label: 'Trong 10km' },
  { value: 20, label: 'Trong 20km' },
  { value: null, label: 'Không giới hạn' },
];

export const BUDGET_OPTIONS: { value: [number | null, number | null]; label: string }[] = [
  { value: [null, null], label: 'Không giới hạn' },
  { value: [null, 100_000], label: 'Dưới 100k' },
  { value: [100_000, 300_000], label: '100k - 300k' },
  { value: [300_000, 500_000], label: '300k - 500k' },
];

export const SOURCE_OPTIONS: { value: RandomFilters['source']; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'wishlist', label: '⭐ Chỉ Wishlist' },
  { value: 'visited', label: '📍 Chỉ đã ghé' },
  { value: 'not_visited', label: '✨ Chưa từng ghé' },
];
