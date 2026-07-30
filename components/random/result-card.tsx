'use client';

import { Heart, ImageOff, MapPin, Navigation, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RatingStamp } from '@/components/place/rating-stamp';
import { PriorityBadge } from '@/components/wishlist/priority-badge';
import { useCandidateThumbnail } from '@/lib/hooks/use-candidate-thumbnail';
import { updatePlace } from '@/lib/db/repositories/place-repo';
import { updateWishlistItem } from '@/lib/db/repositories/wishlist-repo';
import { useToast } from '@/lib/hooks/use-toast';
import type { RandomCandidate } from '@/types';

interface ResultCardProps {
  candidate: RandomCandidate;
  reasons: string[];
  categoryEmoji?: string;
  categoryLabel?: string;
  onRespin: () => void;
  onMarkVisited: () => void;
}

function directionsUrl(candidate: RandomCandidate): string | null {
  if (candidate.googleMapsUrl) return candidate.googleMapsUrl;
  if (candidate.lat !== undefined && candidate.lng !== undefined) {
    return `https://www.google.com/maps/search/?api=1&query=${candidate.lat},${candidate.lng}`;
  }
  return null;
}

export function ResultCard({
  candidate,
  reasons,
  categoryEmoji,
  categoryLabel,
  onRespin,
  onMarkVisited,
}: ResultCardProps) {
  const { toast } = useToast();
  const coverUrl = useCandidateThumbnail(candidate);
  const mapsUrl = directionsUrl(candidate);

  async function handleSaveForWeekend() {
    if (candidate.kind === 'wishlist') {
      await updateWishlistItem(candidate.id, { priority: 'high' });
      toast({ title: 'Đã tăng độ ưu tiên ⭐', description: 'Nơi này giờ ở mức "Rất muốn đi".' });
    } else {
      await updatePlace(candidate.id, { isFavorite: true });
      toast({ title: 'Đã lưu vào Yêu thích ❤️' });
    }
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="h-44 w-full overflow-hidden rounded-2xl bg-muted">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh từ Blob URL
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" strokeWidth={1.4} />
          </div>
        )}
      </div>

      <div className="flex items-start gap-3">
        {candidate.kind === 'place' && candidate.rating ? (
          <RatingStamp rating={candidate.rating} size="sm" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-h3">
            {categoryEmoji} {candidate.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {categoryLabel && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-caption">{categoryLabel}</span>
            )}
            {candidate.kind === 'wishlist' && candidate.priority && (
              <PriorityBadge priority={candidate.priority} />
            )}
          </div>
          {candidate.address && (
            <p className="mt-1.5 flex items-center gap-1 text-caption text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              {candidate.address}
            </p>
          )}
        </div>
      </div>

      {/* Lý do được chọn */}
      <div className="space-y-1.5 rounded-xl bg-accent px-3.5 py-3">
        {reasons.map((reason, i) => (
          <p key={i} className="text-body text-muted-foreground">
            💭 {reason}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Button asChild={!!mapsUrl} disabled={!mapsUrl} className="col-span-2">
          {mapsUrl ? (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="mr-1.5 h-4 w-4" />
              Đi ngay
            </a>
          ) : (
            <span>
              <Navigation className="mr-1.5 h-4 w-4" />
              Chưa có vị trí GPS
            </span>
          )}
        </Button>
        <Button variant="outline" onClick={onRespin}>
          <RotateCcw className="mr-1.5 h-4 w-4" />
          Random lại
        </Button>
        <Button variant="outline" onClick={handleSaveForWeekend}>
          <Heart className="mr-1.5 h-4 w-4" />
          Lưu cuối tuần
        </Button>
        {candidate.kind === 'wishlist' && (
          <Button variant="secondary" className="col-span-2" onClick={onMarkVisited}>
            ✓ Đánh dấu đã đi
          </Button>
        )}
      </div>
    </div>
  );
}
