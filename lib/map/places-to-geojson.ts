import { getRatingColor } from '@/lib/map/rating-color';
import { haversineDistanceKm } from '@/lib/utils/geo';
import type { PlaceWithRelations } from '@/types';

export interface PlaceFeatureProps {
  id: number;
  name: string;
  categoryEmoji: string;
  rating: number;
  ratingColor: string;
  checkinDate: string;
  /** null nếu không có vị trí hiện tại để tính -> không dùng cho lọc "Gần tôi" trên map */
  distanceKm: number | null;
}

interface PlaceFeature {
  id: number;
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
  categoryEmojiById: Record<string, string>,
  currentLocation: { lat: number; lng: number } | null = null
): PlaceFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: places
      .filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number')
      .map((p) => ({
        type: 'Feature',
        id: p.id as number,
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        properties: {
          id: p.id as number,
          name: p.name,
          categoryEmoji: categoryEmojiById[p.categoryId] ?? '📍',
          rating: p.rating,
          ratingColor: getRatingColor(p.rating),
          checkinDate: p.checkinDate,
          distanceKm: currentLocation ? haversineDistanceKm(currentLocation, { lat: p.lat, lng: p.lng }) : null,
        },
      })),
  };
}
