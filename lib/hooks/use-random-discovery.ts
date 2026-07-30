import { useCallback, useMemo, useState } from 'react';
import { usePlaces } from '@/lib/hooks/use-places';
import { useWishlist } from '@/lib/hooks/use-wishlist';
import { useCurrentLocation } from '@/lib/hooks/use-current-location';
import { buildCandidatePool } from '@/lib/random/build-candidates';
import { filterCandidates } from '@/lib/random/filter-candidates';
import { pickRandomCandidate, type RandomPickResult } from '@/lib/random/weighted-pick';
import { getRecentSpinKeys, logSpin } from '@/lib/db/repositories/spin-history-repo';
import { DEFAULT_RANDOM_FILTERS } from '@/lib/random/default-filters';
import type { RandomFilters } from '@/types';

export function useRandomDiscovery() {
  const places = usePlaces();
  const wishlist = useWishlist();
  const currentLocation = useCurrentLocation();

  const [filters, setFilters] = useState<RandomFilters>(DEFAULT_RANDOM_FILTERS);
  const [result, setResult] = useState<RandomPickResult | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const pool = useMemo(
    () => buildCandidatePool(places ?? [], wishlist ?? []),
    [places, wishlist]
  );

  const filteredPool = useMemo(
    () => filterCandidates(pool, filters, currentLocation),
    [pool, filters, currentLocation]
  );

  const spin = useCallback(
    async (excludeCurrent = false) => {
      setIsSpinning(true);
      try {
        const recentKeys = await getRecentSpinKeys();
        const excludeKey = excludeCurrent && result ? `${result.candidate.kind}:${result.candidate.id}` : undefined;

        // Delay giả lập animation "quay số" ~2 giây, đúng cảm giác Spotify Shuffle/Netflix Surprise Me
        await new Promise((resolve) => setTimeout(resolve, 1800));

        const picked = pickRandomCandidate(filteredPool, currentLocation, recentKeys, excludeKey);
        setResult(picked);

        if (picked) {
          await logSpin(picked.candidate.kind, picked.candidate.id);
        }
      } finally {
        setIsSpinning(false);
      }
    },
    [filteredPool, currentLocation, result]
  );

  const reset = useCallback(() => setResult(null), []);

  return {
    filters,
    setFilters,
    pool: filteredPool,
    poolSize: filteredPool.length,
    result,
    isSpinning,
    spin,
    reset,
  };
}
