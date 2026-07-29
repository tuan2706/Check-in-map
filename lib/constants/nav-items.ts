import { Heart, History, LayoutGrid, MapIcon, Settings as SettingsIcon, TentTree } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: typeof MapIcon;
}

/**
 * Nguồn dữ liệu duy nhất cho điều hướng — Sidebar và BottomNav đều import từ đây
 * để không bao giờ bị lệch thứ tự/label giữa 2 nơi hiển thị.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Trang chủ', icon: TentTree },
  { href: '/map', label: 'Bản đồ', icon: MapIcon },
  { href: '/places', label: 'Địa điểm', icon: LayoutGrid },
  { href: '/favorites', label: 'Yêu thích', icon: Heart },
  { href: '/timeline', label: 'Dòng thời gian', icon: History },
  { href: '/settings', label: 'Cài đặt', icon: SettingsIcon },
];
