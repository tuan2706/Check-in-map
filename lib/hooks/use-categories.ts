import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';

export function useCategories() {
  return useLiveQuery(() => db.categories.toArray(), []);
}
