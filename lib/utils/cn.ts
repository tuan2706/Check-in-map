import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Gộp className an toàn: clsx xử lý điều kiện, twMerge loại bỏ xung đột
 * class Tailwind (vd: "p-2 p-4" -> chỉ giữ "p-4").
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
