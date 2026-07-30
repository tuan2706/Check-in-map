import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import { getWeeklySpinHistory } from '@/lib/db/repositories/spin-history-repo';

export interface SpinHistoryDisplayItem {
  id: number;
  name: string;
  emoji: string;
  spunAt: number;
}

export function useSpinHistory(): SpinHistoryDisplayItem[] | undefined {
  return useLiveQuery(async () => {
    const entries = await getWeeklySpinHistory();
    const categories = await db.categories.toArray();
    const emojiByCategory = new Map(categories.map((c) => [c.id, c.emoji]));

    const items = await Promise.all(
      entries.map(async (entry) => {
        const record =
          entry.candidateKind === 'place'
            ? await db.places.get(entry.candidateId)
            : await db.wishlistPlaces.get(entry.candidateId);

        if (!record) return null;

        return {
          id: entry.id as number,
          name: record.name,
          emoji: emojiByCategory.get(record.categoryId) ?? '📍',
          spunAt: entry.spunAt,
        };
      })
    );

    return items.filter((i): i is SpinHistoryDisplayItem => i !== null);
  }, []);
}
