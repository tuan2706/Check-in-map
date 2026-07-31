import { useMemo } from 'react';
import { usePlaces } from '@/lib/hooks/use-places';
import { useWishlist } from '@/lib/hooks/use-wishlist';
import { useCurrentLocation } from '@/lib/hooks/use-current-location';
import { buildCandidatePool } from '@/lib/random/build-candidates';
import { pickRandomCandidate } from '@/lib/random/weighted-pick';
import { haversineDistanceKm } from '@/lib/utils/geo';
import type { RandomCandidate } from '@/types';

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

export interface NearbyDiscoveryGroups {
  wishlistNearby: RandomCandidate[];
  favoritesNearby: RandomCandidate[];
  staleNearby: RandomCandidate[];
  topRatedNearby: RandomCandidate[];
  smartPick: RandomCandidate | null;
  hasLocation: boolean;
  hasAnyData: boolean;
}

export function useNearbyDiscovery(radiusKm: number): NearbyDiscoveryGroups {
  const places = usePlaces();
  const wishlist = useWishlist();
  const currentLocation = useCurrentLocation();

  return useMemo(() => {
    const pool = buildCandidatePool(places ?? [], wishlist ?? []);

    if (!currentLocation) {
      return {
        wishlistNearby: [],
        favoritesNearby: [],
        staleNearby: [],
        topRatedNearby: [],
        smartPick: null,
        hasLocation: false,
        hasAnyData: pool.length > 0,
      };
    }

    const withDistance = pool
      .filter((c) => c.lat !== undefined && c.lng !== undefined)
      .map((c) => ({
        candidate: c,
        distanceKm: haversineDistanceKm(currentLocation, { lat: c.lat as number, lng: c.lng as number }),
      }))
      .filter((c) => c.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const wishlistNearby = withDistance.filter((c) => c.candidate.kind === 'wishlist').slice(0, 3);
    const favoritesNearby = withDistance.filter((c) => c.candidate.isFavorite).slice(0, 3);
    const staleNearby = withDistance
      .filter((c) => c.candidate.kind === 'place' && Date.now() - c.candidate.addedOrCheckedInAt > SIX_MONTHS_MS)
      .slice(0, 3);
    const topRatedNearby = withDistance
      .filter((c) => c.candidate.kind === 'place' && (c.candidate.rating ?? 0) >= 4)
      .slice(0, 3);

    const smartPickResult = pickRandomCandidate(
      withDistance.map((c) => c.candidate),
      currentLocation,
      new Set()
    );

    return {
      wishlistNearby: wishlistNearby.map((c) => c.candidate),
      favoritesNearby: favoritesNearby.map((c) => c.candidate),
      staleNearby: staleNearby.map((c) => c.candidate),
      topRatedNearby: topRatedNearby.map((c) => c.candidate),
      smartPick: smartPickResult?.candidate ?? null,
      hasLocation: true,
      hasAnyData: withDistance.length > 0,
    };
  }, [places, wishlist, currentLocation, radiusKm]);
}
