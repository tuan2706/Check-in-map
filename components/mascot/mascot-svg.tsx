export function MascotSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Thân — hình ghim bản đồ bo tròn */}
      <path
        d="M32 4C19.85 4 10 13.85 10 26c0 16 22 34 22 34s22-18 22-34C54 13.85 44.15 4 32 4Z"
        fill="hsl(var(--primary))"
      />
      {/* Mặt trong sáng hơn */}
      <circle cx="32" cy="26" r="15" fill="white" fillOpacity="0.95" />
      {/* Kim la bàn nhỏ thay vì mắt/miệng truyền thống — giữ đúng tinh thần "la bàn đồng hành" */}
      <circle cx="32" cy="26" r="2" fill="hsl(var(--primary))" />
      <path d="M32 17 L35 26 L32 24 L29 26 Z" fill="hsl(var(--primary))" />
      <path d="M32 35 L29 26 L32 28 L35 26 Z" fill="hsl(var(--secondary))" />
      {/* 2 mắt chấm nhỏ, dễ thương, tối giản */}
      <circle cx="26" cy="22" r="1.6" fill="hsl(var(--foreground))" />
      <circle cx="38" cy="22" r="1.6" fill="hsl(var(--foreground))" />
      {/* Nụ cười nhẹ */}
      <path
        d="M27 31c1.5 1.5 3.2 2.2 5 2.2s3.5-0.7 5-2.2"
        stroke="hsl(var(--foreground))"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
