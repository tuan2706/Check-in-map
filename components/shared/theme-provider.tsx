'use client';

import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);
  const theme = settings?.theme ?? 'system';

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(t: 'light' | 'dark' | 'system') {
      const isDark =
        t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.classList.toggle('dark', isDark);
    }

    applyTheme(theme);

    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
  }, [theme]);

  return <>{children}</>;
}

export async function setAppTheme(theme: 'light' | 'dark' | 'system') {
  const existing = await db.settings.toCollection().first();
  if (existing?.id) {
    await db.settings.update(existing.id, { theme });
  } else {
    await db.settings.add({ theme, mapStyle: 'streets' });
  }
}
