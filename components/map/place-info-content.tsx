import { X } from 'lucide-react';
import { RatingStamp } from '@/components/place/rating-stamp';
import type { Rating } from '@/types';
import type { PlaceFeatureProps } from '@/lib/map/places-to-geojson';

interface PlaceInfoContentProps {
  data: PlaceFeatureProps;
  onClose: () => void;
}

export function PlaceInfoContent({ data, onClose }: PlaceInfoContentProps) {
  return (
    <div className="flex items-center gap-3 p-1">
      <RatingStamp rating={data.rating as Rating} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-h4">
          {data.categoryEmoji} {data.name}
        </p>
        <p className="font-mono text-[11px] text-muted-foreground">{data.checkinDate}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="ml-1 shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-accent"
        aria-label="Đóng"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
