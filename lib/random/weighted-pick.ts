import { formatDistance, haversineDistanceKm } from '@/lib/utils/geo';
import type { RandomCandidate } from '@/types';

interface WeightedCandidate {
  candidate: RandomCandidate;
  weight: number;
  reasons: string[];
}

function formatTimeAgo(timestamp: number): string {
  const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
  if (days < 1) return 'vừa mới lưu hôm nay';
  if (days < 30) return `đã lưu ${days} ngày trước`;
  const months = Math.floor(days / 30);
  return `đã lưu ${months} tháng trước`;
}

function computeWeight(
  candidate: RandomCandidate,
  currentLocation: { lat: number; lng: number } | null,
  recentSpinKeys: Set<string>
): WeightedCandidate {
  let weight = 1;
  const reasons: string[] = [];

  if (candidate.kind === 'wishlist') {
    weight += 2;
    reasons.push('Bạn chưa từng đến đây');

    if (candidate.priority === 'high') {
      weight += 2;
      reasons.push('Nằm trong danh sách rất muốn đi');
    } else if (candidate.priority === 'medium') {
      weight += 1;
    }
  }

  if (candidate.lat !== undefined && candidate.lng !== undefined && currentLocation) {
    const distanceKm = haversineDistanceKm(currentLocation, { lat: candidate.lat, lng: candidate.lng });
    weight += Math.max(0, (15 - distanceKm) / 15) * 2;
    if (distanceKm < 10) {
      reasons.push(`Cách bạn chỉ ${formatDistance(distanceKm)}`);
    }
  }

  reasons.push(
    candidate.kind === 'wishlist'
      ? formatTimeAgo(candidate.addedOrCheckedInAt).replace('lưu', 'lưu vào wishlist')
      : `Đã check-in ${formatTimeAgo(candidate.addedOrCheckedInAt).replace('lưu ', '')}`
  );

  if (candidate.kind === 'place' && candidate.rating && candidate.rating >= 4) {
    weight += 1;
    reasons.push(`Bạn từng đánh giá ${candidate.rating}★`);
  }

  const key = `${candidate.kind}:${candidate.id}`;
  if (recentSpinKeys.has(key)) {
    weight *= 0.15; // không loại hẳn, chỉ giảm mạnh xác suất bị chọn lại
  }

  return { candidate, weight: Math.max(weight, 0.05), reasons };
}

export interface RandomPickResult {
  candidate: RandomCandidate;
  reasons: string[];
}

/**
 * Random có trọng số thay vì random đều — ứng viên có điểm cao hơn (Wishlist, priority cao,
 * gần vị trí hiện tại, chưa random gần đây) có xác suất được chọn cao hơn, nhưng vẫn có thể
 * ra bất kỳ ứng viên nào (không phải luôn luôn chọn điểm cao nhất — vẫn cần yếu tố "bất ngờ").
 */
export function pickRandomCandidate(
  pool: RandomCandidate[],
  currentLocation: { lat: number; lng: number } | null,
  recentSpinKeys: Set<string>,
  excludeKey?: string
): RandomPickResult | null {
  const candidates = excludeKey
    ? pool.filter((c) => `${c.kind}:${c.id}` !== excludeKey)
    : pool;

  if (candidates.length === 0) return null;

  const weighted = candidates.map((c) => computeWeight(c, currentLocation, recentSpinKeys));
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);

  let roll = Math.random() * totalWeight;
  for (const w of weighted) {
    roll -= w.weight;
    if (roll <= 0) return { candidate: w.candidate, reasons: w.reasons };
  }

  const fallback = weighted[weighted.length - 1];
  return fallback ? { candidate: fallback.candidate, reasons: fallback.reasons } : null;
}
