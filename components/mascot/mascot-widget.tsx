'use client';

import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { X } from 'lucide-react';
import { MascotSvg } from '@/components/mascot/mascot-svg';
import { useMascotTips } from '@/lib/hooks/use-mascot-tips';
import { db } from '@/lib/db/schema';

const FREQUENCY_INTERVAL_MS: Record<'low' | 'medium' | 'high', number | null> = {
  low: null, // chỉ hiện 1 lần khi mở app, không lặp lại
  medium: 90_000,
  high: 30_000,
};

const AUTO_HIDE_MS = 8000;

export function MascotWidget() {
  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);
  const tips = useMascotTips();
  const [visible, setVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  const autoHideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enabled = settings?.mascotEnabled ?? true;
  const frequency = settings?.mascotFrequency ?? 'medium';

  function showTip() {
    if (tips.length === 0) return;
    const tip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentTip(tip ?? '');
    setVisible(true);

    if (autoHideTimeout.current) clearTimeout(autoHideTimeout.current);
    autoHideTimeout.current = setTimeout(() => setVisible(false), AUTO_HIDE_MS);
  }

  useEffect(() => {
    if (!enabled) return;

    const firstShow = setTimeout(showTip, 3000);
    const intervalMs = FREQUENCY_INTERVAL_MS[frequency];
    const interval = intervalMs ? setInterval(showTip, intervalMs) : null;

    return () => {
      clearTimeout(firstShow);
      if (interval) clearInterval(interval);
      if (autoHideTimeout.current) clearTimeout(autoHideTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, frequency]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed right-3 top-20 z-40 flex flex-col items-end gap-2 sm:right-5 sm:top-24">
      {visible && currentTip && (
        <div className="animate-fade-in pointer-events-auto max-w-[220px] rounded-2xl rounded-tr-sm border border-border bg-card px-3.5 py-2.5 text-caption shadow-lg shadow-black/10">
          <div className="flex items-start gap-2">
            <p className="flex-1">{currentTip}</p>
            <button
              onClick={() => setVisible(false)}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Đóng"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={showTip}
        className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-card shadow-lg shadow-black/10 transition-transform hover:scale-105 active:scale-95"
        aria-label="Mascot đồng hành"
      >
        <MascotSvg className="h-8 w-8" />
      </button>
    </div>
  );
}
