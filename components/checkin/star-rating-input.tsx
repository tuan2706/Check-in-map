'use client';

import { Star } from 'lucide-react';
import { getRatingColor } from '@/lib/map/rating-color';
import type { Rating } from '@/types';

interface StarRatingInputProps {
  value: Rating;
  onChange: (rating: Rating) => void;
}

export function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  const color = getRatingColor(value);

  return (
    <div className="flex items-center gap-1">
      {([1, 2, 3, 4, 5] as Rating[]).map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform active:scale-90"
            aria-label={`${star} sao`}
          >
            <Star
              className="h-7 w-7"
              fill={filled ? color : 'transparent'}
              color={filled ? color : 'hsl(var(--muted-foreground))'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
