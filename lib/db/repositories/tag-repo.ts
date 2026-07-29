import { db } from '@/lib/db/schema';

/** Chuẩn hoá tag: bỏ dấu #, trim, viết thường để tránh trùng lặp (#Ngon vs #ngon) */
function normalizeTagName(raw: string): string {
  return raw.trim().replace(/^#/, '').toLowerCase();
}

/** Tìm tag theo tên, nếu chưa có thì tạo mới. Trả về id. */
export async function findOrCreateTag(rawName: string): Promise<number> {
  const name = normalizeTagName(rawName);
  const existing = await db.tags.where('name').equals(name).first();
  if (existing?.id) return existing.id;
  return db.tags.add({ name });
}

export async function getAllTags() {
  return db.tags.toArray();
}
