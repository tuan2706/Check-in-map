'use client';

import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { X } from 'lucide-react';
import { MascotSvg } from '@/components/mascot/mascot-svg';
import { useMascotTips } from '@/lib/hooks/use-mascot-tips';
import { db } from '@/lib/db/schema';

const AUTO_HIDE_MS = 8000;

/**
 * Mascot chỉ là 1 icon nhỏ, KHÔNG tự động hiện bong bóng nhắc nhở (đổi theo yêu cầu
 * Version 5 — Progressive Disclosure). Lời nhắc chỉ hiện khi người dùng chủ động bấm
 * vào icon, và tự ẩn sau vài giây.
 */
export function MascotWidget() {
  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);
  const tips = useMascotTips();
  const [visible, setVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  const autoHideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enabled = settings?.mascotEnabled ?? true;

  function showTip() {
    if (tips.length === 0) return;
    const tip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentTip(tip ?? '');
    setVisible(true);

    if (autoHideTimeout.current) clearTimeout(autoHideTimeout.current);
    autoHideTimeout.current = setTimeout(() => setVisible(false), AUTO_HIDE_MS);
  }

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
