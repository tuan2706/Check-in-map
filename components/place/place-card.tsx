import Link from 'next/link';
import { ImageOff, MapPin } from 'lucide-react';
import { RatingStamp } from '@/components/place/rating-stamp';
import { CategoryBadge } from '@/components/place/category-badge';
import { useCoverThumbnail } from '@/lib/hooks/use-cover-thumbnail';
import { formatDistance, haversineDistanceKm } from '@/lib/utils/geo';
import type { Category, PlaceWithRelations } from '@/types';

interface PlaceCardProps {
  place: PlaceWithRelations;
  category?: Category;
  currentLocation?: { lat: number; lng: number } | null;
}

export function PlaceCard({ place, category, currentLocation }: PlaceCardProps) {
  const coverUrl = useCoverThumbnail(place.coverImageId);
  const distanceKm = currentLocation
    ? haversineDistanceKm(currentLocation, { lat: place.lat, lng: place.lng })
    : null;

  return (
    <Link
      href={`/places/${place.id}`}
      className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/5"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh từ Blob URL trong IndexedDB
          <img src={coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-5 w-5" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute bottom-0.5 right-0.5">
          <RatingStamp rating={place.rating} size="sm" className="scale-[0.55] origin-bottom-right" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-h4">{place.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {category && <CategoryBadge category={category} />}
          <span className="font-mono text-[11px] text-muted-foreground">{place.checkinDate}</span>
        </div>
        {place.address && (
          <p className="mt-1 flex items-center gap-1 truncate text-caption text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            {place.address}
            {distanceKm !== null && <span className="shrink-0">· {formatDistance(distanceKm)}</span>}
          </p>
        )}
      </div>

      {place.isFavorite && (
        <span aria-hidden className="shrink-0">
          ❤️
        </span>
      )}
    </Link>
  );
}
