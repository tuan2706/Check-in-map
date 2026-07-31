import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import { usePlaces } from '@/lib/hooks/use-places';
import { useWishlist } from '@/lib/hooks/use-wishlist';
import { useCurrentLocation } from '@/lib/hooks/use-current-location';
import { buildCandidatePool } from '@/lib/random/build-candidates';
import { haversineDistanceKm } from '@/lib/utils/geo';
import type { RandomCandidate } from '@/types';

export interface PassingByResult {
  candidate: RandomCandidate;
  distanceKm: number;
  reason: string;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildReason(candidate: RandomCandidate, distanceKm: number): string {
  const distanceText = distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`;
  if (candidate.kind === 'wishlist') {
    return `Có một địa điểm trong Wishlist chỉ cách bạn ${distanceText}.`;
  }
  if (candidate.isFavorite) {
    return `Quán yêu thích của bạn đang ở ngay gần đây (${distanceText}).`;
  }
  if (candidate.rating === 5) {
    return `Đây là địa điểm bạn đánh giá 5 sao, cách ${distanceText}. Có muốn ghé lại không?`;
  }
  return `Bạn đang cách "${candidate.name}" chỉ ${distanceText}.`;
}

/**
 * Chỉ tính toán khi hook được mount (tức khi mở app / chuyển sang Home-Map-Địa điểm) —
 * KHÔNG theo dõi vị trí liên tục trong nền, đúng yêu cầu tiết kiệm pin.
 */
export function usePassingBy(): {
  result: PassingByResult | null;
  dismiss: () => void;
  hideForToday: () => void;
} {
  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);
  const places = usePlaces();
  const wishlist = useWishlist();
  const currentLocation = useCurrentLocation();
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  const enabled = settings?.passingByEnabled ?? false;
  const radiusKm = (settings?.passingByRadiusM ?? 500) / 1000;
  const dailyLimit = settings?.passingByDailyLimit ?? 5;

  const isHiddenToday = !!settings?.passingByHiddenUntil && settings.passingByHiddenUntil > Date.now();
  const shownCountToday = settings?.passingByShownDate === todayKey() ? settings?.passingByShownCount ?? 0 : 0;

  const candidate = useMemo(() => {
    if (!enabled || isHiddenToday || !currentLocation || shownCountToday >= dailyLimit) return null;

    const pool = buildCandidatePool(places ?? [], wishlist ?? []);
    let closest: { candidate: RandomCandidate; distanceKm: number } | null = null;

    for (const c of pool) {
      if (c.lat === undefined || c.lng === undefined) continue;
      const d = haversineDistanceKm(currentLocation, { lat: c.lat, lng: c.lng });
      if (d > radiusKm) continue;
      if (!closest || d < closest.distanceKm) closest = { candidate: c, distanceKm: d };
    }

    return closest;
  }, [enabled, isHiddenToday, currentLocation, shownCountToday, dailyLimit, places, wishlist, radiusKm]);

  const candidateKey = candidate ? `${candidate.candidate.kind}:${candidate.candidate.id}` : null;

  useEffect(() => {
    if (!candidate || candidateKey === dismissedKey) return;

    async function bumpShownCount() {
      const existing = await db.settings.toCollection().first();
      const isNewDay = existing?.passingByShownDate !== todayKey();
      if (existing?.id) {
        await db.settings.update(existing.id, {
          passingByShownDate: todayKey(),
          passingByShownCount: isNewDay ? 1 : (existing.passingByShownCount ?? 0) + 1,
        });
      }
    }
    void bumpShownCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateKey]);

  async function dismiss() {
    if (candidateKey) setDismissedKey(candidateKey);
  }

  async function hideForToday() {
    const existing = await db.settings.toCollection().first();
    if (existing?.id) {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      await db.settings.update(existing.id, { passingByHiddenUntil: endOfDay.getTime() });
    }
  }

  if (!candidate || candidateKey === dismissedKey) {
    return { result: null, dismiss, hideForToday };
  }

  return {
    result: {
      candidate: candidate.candidate,
      distanceKm: candidate.distanceKm,
      reason: buildReason(candidate.candidate, candidate.distanceKm),
    },
    dismiss,
    hideForToday,
  };
}
