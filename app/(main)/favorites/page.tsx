'use client';

import { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { PlaceCard } from '@/components/place/place-card';
import { PlaceListSkeleton } from '@/components/place/place-list-skeleton';
import { usePlaces } from '@/lib/hooks/use-places';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCurrentLocation } from '@/lib/hooks/use-current-location';

export default function FavoritesPage() {
  const places = usePlaces();
  const categories = useCategories();
  const currentLocation = useCurrentLocation();
  const categoryById = useMemo(() => new Map(categories?.map((c) => [c.id, c])), [categories]);

  const favorites = places?.filter((p) => p.isFavorite);

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-5 pt-6 lg:p-8 animate-fade-in">
      <PageHeader title="Yêu thích" subtitle="Những nơi bạn nhất định muốn quay lại" />

      {places === undefined ? (
        <PlaceListSkeleton />
      ) : favorites && favorites.length > 0 ? (
        <div className="space-y-2.5">
          {favorites.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              category={categoryById.get(place.categoryId)}
              currentLocation={currentLocation}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="Chưa có nơi yêu thích"
          description="Bấm ❤️ ở trang chi tiết bất kỳ địa điểm nào để lưu vào đây."
        />
      )}
    </main>
  );
}
