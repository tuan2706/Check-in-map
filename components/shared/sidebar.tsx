'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { NAV_ITEMS } from '@/lib/constants/nav-items';

/**
 * Sidebar cố định bên trái — chỉ hiển thị từ breakpoint lg trở lên.
 * Bố cục giống Google Maps desktop: sidebar hẹp bên trái + vùng nội dung/map chiếm phần còn lại.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="text-h3 text-primary">My Check-in Map</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4 font-mono text-[11px] text-muted-foreground">
        Sổ tay du lịch cá nhân — offline & riêng tư
      </div>
    </aside>
  );
}
