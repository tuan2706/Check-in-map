import { db } from '@/lib/db/schema';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function logSpin(candidateKind: 'place' | 'wishlist', candidateId: number) {
  await db.spinHistory.add({ candidateKind, candidateId, spunAt: Date.now() });
}

/** Danh sách id đã random gần đây (7 ngày) — dùng để giảm trọng số/loại trừ khi random tiếp */
export async function getRecentSpinKeys(): Promise<Set<string>> {
  const since = Date.now() - SEVEN_DAYS_MS;
  const recent = await db.spinHistory.where('spunAt').above(since).toArray();
  return new Set(recent.map((r) => `${r.candidateKind}:${r.candidateId}`));
}

/** Lịch sử trong tuần để hiển thị "Tuần này đã đi đâu" — mới nhất hiển thị trước */
export async function getWeeklySpinHistory() {
  const since = Date.now() - SEVEN_DAYS_MS;
  const entries = await db.spinHistory.where('spunAt').above(since).sortBy('spunAt');
  return entries.reverse();
}
