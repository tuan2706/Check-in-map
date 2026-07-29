import { getRatingColor } from '@/lib/map/rating-color';
import type { PlaceWithRelations } from '@/types';

export interface PlaceFeatureProps {
  id: number;
  name: string;
  categoryEmoji: string;
  rating: number;
  ratingColor: string;
  checkinDate: string;
}

interface PlaceFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: PlaceFeatureProps;
}

export interface PlaceFeatureCollection {
  type: 'FeatureCollection';
  features: PlaceFeature[];
}

export function placesToGeoJSON(
  places: PlaceWithRelations[],
  categoryEmojiById: Record<string, string>
): PlaceFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: places
      .filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number')
      .map((p) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        properties: {
          id: p.id as number,
          name: p.name,
          categoryEmoji: categoryEmojiById[p.categoryId] ?? '📍',
          rating: p.rating,
          ratingColor: getRatingColor(p.rating),
          checkinDate: p.checkinDate,
        },
      })),
  };
}
