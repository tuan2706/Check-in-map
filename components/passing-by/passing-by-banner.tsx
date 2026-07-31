'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dices, Heart, MapPin, Navigation, X } from 'lucide-react';
import { updatePlace } from '@/lib/db/repositories/place-repo';
import { useToast } from '@/lib/hooks/use-toast';
import type { PassingByResult } from '@/lib/hooks/use-passing-by';

interface PassingByBannerProps {
  data: PassingByResult;
  onDismiss: () => void;
  onHideToday: () => void;
  onRandomNearby?: () => void;
}

export function PassingByBanner({ data, onDismiss, onHideToday, onRandomNearby }: PassingByBannerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [hidden, setHidden] = useState(false);
  const { candidate } = data;

  if (hidden) return null;

  function directionsUrl(): string | null {
    if (candidate.googleMapsUrl) return candidate.googleMapsUrl;
    if (candidate.lat !== undefined && candidate.lng !== undefined) {
      return `https://www.google.com/maps/search/?api=1&query=${candidate.lat},${candidate.lng}`;
    }
    return null;
  }

  async function handleFavorite() {
    if (candidate.kind === 'place') {
      await updatePlace(candidate.id, { isFavorite: true });
      toast({ title: 'Đã lưu vào Yêu thích ❤️' });
    }
  }

  const mapsUrl = directionsUrl();

  return (
    <div className="animate-fade-in flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-md shadow-black/5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MapPin className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-body">{data.reason}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            onClick={() => router.push('/map')}
            className="rounded-full border border-border bg-background px-2.5 py-1 text-caption hover:bg-accent"
          >
            📍 Xem trên bản đồ
          </button>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-caption hover:bg-accent"
            >
              <Navigation className="h-3 w-3" /> Dẫn đường
            </a>
          )}
          {candidate.kind === 'place' && !candidate.isFavorite && (
            <button
              onClick={handleFavorite}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-caption hover:bg-accent"
            >
              <Heart className="h-3 w-3" /> Yêu thích
            </button>
          )}
          {onRandomNearby && (
            <button
              onClick={onRandomNearby}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-caption hover:bg-accent"
            >
              <Dices className="h-3 w-3" /> Random gần đây
            </button>
          )}
          <button
            onClick={onHideToday}
            className="rounded-full px-2.5 py-1 text-caption text-muted-foreground hover:bg-accent"
          >
            Tạm ẩn hôm nay
          </button>
        </div>
      </div>
      <button
        onClick={() => {
          setHidden(true);
          onDismiss();
        }}
        className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-accent"
        aria-label="Bỏ qua"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
