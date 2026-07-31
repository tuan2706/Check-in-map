import { db } from '@/lib/db/schema';
import type { AppSettings } from '@/types';

export async function updateSettings(changes: Partial<AppSettings>): Promise<void> {
  const existing = await db.settings.toCollection().first();
  if (existing?.id) {
    await db.settings.update(existing.id, changes);
  } else {
    await db.settings.add({ theme: 'system', mapStyle: 'streets', ...changes });
  }
}
