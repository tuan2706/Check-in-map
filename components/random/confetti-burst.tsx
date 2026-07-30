'use client';

import { useMemo } from 'react';

const COLORS = ['#FF6B4A', '#eab308', '#146C6C', '#22c55e', '#3b82f6'];

/**
 * Confetti tự chế: mỗi mảnh là 1 div nhỏ, rơi từ trên xuống bằng CSS animation
 * (keyframe .confetti-piece khai báo trong globals.css). Không dùng canvas-confetti
 * hay bất kỳ thư viện ngoài nào để tránh phải npm install thêm.
 */
export function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 1.4 + Math.random() * 0.8,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-0 h-2.5 w-1.5 rounded-sm"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
