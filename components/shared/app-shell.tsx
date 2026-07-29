import { BottomNav } from '@/components/shared/bottom-nav';
import { Sidebar } from '@/components/shared/sidebar';

/**
 * Khung layout dùng chung cho toàn bộ 6 trang chính.
 * - Desktop (lg+): Sidebar cố định bên trái, nội dung dịch phải 15rem (w-60)
 * - Mobile: BottomNav cố định dưới cùng, nội dung chừa padding-bottom để không bị che
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="pb-[72px] lg:pb-0 lg:pl-60">{children}</div>
      <BottomNav />
    </div>
  );
}
