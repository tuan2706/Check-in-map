'use client';

import { useRouter } from 'next/navigation';
import { ImageOff, MapPin } from 'lucide-react';
import { RatingStamp } from '@/components/place/rating-stamp';
import { PriorityBadge } from '@/components/wishlist/priority-badge';
import { useCandidateThumbnail } from '@/lib/hooks/use-candidate-thumbnail';
import { formatDistance, haversineDistanceKm } from '@/lib/utils/geo';
import type { RandomCandidate } from '@/types';

export function DiscoverCard({
  candidate,
  categoryEmoji,
  currentLocation,
  onClick,
}: {
  candidate: RandomCandidate;
  categoryEmoji?: string;
  currentLocation: { lat: number; lng: number } | null;
  onClick?: () => void;
}) {
  const router = useRouter();
  const coverUrl = useCandidateThumbnail(candidate);
  const distanceKm =
    currentLocation && candidate.lat !== undefined && candidate.lng !== undefined
      ? haversineDistanceKm(currentLocation, { lat: candidate.lat, lng: candidate.lng })
      : null;

  return (
    <button
      onClick={onClick ?? (() => candidate.kind === 'place' && router.push(`/places/${candidate.id}`))}
      className="w-40 shrink-0 rounded-2xl border border-border bg-card p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/5"
    >
      <div className="mb-2 h-24 w-full overflow-hidden rounded-xl bg-muted">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh từ Blob URL
          <img src={coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-5 w-5" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <p className="truncate text-h4">
        {categoryEmoji} {candidate.name}
      </p>
      <div className="mt-1 flex items-center gap-1.5">
        {candidate.kind === 'place' && candidate.rating ? (
          <RatingStamp rating={candidate.rating} size="sm" className="scale-[0.5] origin-left" />
        ) : candidate.kind === 'wishlist' && candidate.priority ? (
          <PriorityBadge priority={candidate.priority} />
        ) : null}
      </div>
      {distanceKm !== null && (
        <p className="mt-1 flex items-center gap-1 text-caption text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {formatDistance(distanceKm)}
        </p>
      )}
    </button>
  );
}
