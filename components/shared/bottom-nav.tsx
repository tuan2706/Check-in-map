'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { NAV_ITEMS } from '@/lib/constants/nav-items';

/**
 * Thanh điều hướng dưới cùng — chỉ hiển thị trên mobile/tablet nhỏ (< lg breakpoint).
 * Trên desktop, Sidebar đảm nhiệm vai trò này (xem components/shared/sidebar.tsx).
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-safe pt-1.5 backdrop-blur lg:hidden"
      aria-label="Điều hướng chính"
    >
      <ul className="grid grid-cols-6">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className="flex flex-col items-center gap-0.5 py-1.5 transition-colors"
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform',
                    isActive ? 'scale-110 text-primary' : 'text-muted-foreground'
                  )}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
                <span
                  className={cn(
                    'text-[10px] leading-none',
                    isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
