'use client';

import { useEffect, useState } from 'react';
import { Dices } from 'lucide-react';
import type { RandomCandidate } from '@/types';

interface SpinCyclingPreviewProps {
  pool: RandomCandidate[];
  categoryEmojiById: Record<string, string>;
}

/**
 * Trong lúc chờ (~1.8s), cuộn nhanh qua tên các ứng viên trong pool để tạo cảm giác
 * "đang quay số" giống Spotify Shuffle — thuần CSS/JS, không cần thư viện animation nào.
 */
export function SpinCyclingPreview({ pool, categoryEmojiById }: SpinCyclingPreviewProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (pool.length === 0) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % pool.length);
    }, 110);
    return () => clearInterval(interval);
  }, [pool.length]);

  const current = pool[index];

  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div className="spin-cycling flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Dices className="h-9 w-9" strokeWidth={1.6} />
      </div>
      <p className="spin-cycling text-h3">
        {current ? `${categoryEmojiById[current.categoryId] ?? '📍'} ${current.name}` : 'Đang tìm...'}
      </p>
      <p className="text-caption text-muted-foreground">Đang chọn nơi phù hợp nhất cho bạn...</p>
    </div>
  );
}
