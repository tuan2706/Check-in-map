import { useMemo } from 'react';
import type { Category, PlaceWithRelations } from '@/types';

export interface CategoryStat {
  categoryId: string;
  label: string;
  emoji: string;
  color: string;
  count: number;
}

export interface PlaceStats {
  totalPlaces: number;
  totalImages: number;
  averageRating: number;
  totalCost: number;
  provinceCount: number; // ước lượng thô từ address (số địa chỉ khác nhau)
  categoryStats: CategoryStat[];
  topPlaces: PlaceWithRelations[]; // rating cao nhất
  topDishes: { dish: string; count: number }[];
}

export function useStats(
  places: PlaceWithRelations[] | undefined,
  categories: Category[] | undefined
): PlaceStats {
  return useMemo(() => {
    const list = places ?? [];
    const cats = categories ?? [];

    const totalPlaces = list.length;
    const totalImages = list.reduce((sum, p) => sum + p.imageCount, 0);
    const averageRating = totalPlaces
      ? Math.round((list.reduce((sum, p) => sum + p.rating, 0) / totalPlaces) * 10) / 10
      : 0;
    const totalCost = list.reduce((sum, p) => sum + (p.cost ?? 0), 0);

    const addressSet = new Set(list.map((p) => p.address?.split(',').pop()?.trim()).filter(Boolean));

    const countByCategory = new Map<string, number>();
    for (const p of list) countByCategory.set(p.categoryId, (countByCategory.get(p.categoryId) ?? 0) + 1);

    const categoryStats: CategoryStat[] = cats
      .map((c) => ({
        categoryId: c.id,
        label: c.label,
        emoji: c.emoji,
        color: c.color,
        count: countByCategory.get(c.id) ?? 0,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);

    const topPlaces = [...list].sort((a, b) => b.rating - a.rating).slice(0, 5);

    const dishCount = new Map<string, number>();
    for (const p of list) {
      if (!p.recommendedDish) continue;
      dishCount.set(p.recommendedDish, (dishCount.get(p.recommendedDish) ?? 0) + 1);
    }
    const topDishes = [...dishCount.entries()]
      .map(([dish, count]) => ({ dish, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalPlaces,
      totalImages,
      averageRating,
      totalCost,
      provinceCount: addressSet.size,
      categoryStats,
      topPlaces,
      topDishes,
    };
  }, [places, categories]);
}
