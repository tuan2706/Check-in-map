import { z } from 'zod';
import type { WishlistPriority, WishlistSource } from '@/types';

export const wishlistFormSchema = z.object({
  name: z.string().min(2, 'Tên địa điểm cần ít nhất 2 ký tự').max(120),
  categoryId: z.string().min(1, 'Chọn một danh mục'),
  address: z.string().max(200).optional().or(z.literal('')),
  lat: z.number().optional(),
  lng: z.number().optional(),
  googleMapsUrl: z.string().url('Link không hợp lệ').optional().or(z.literal('')),
  source: z.string().optional().or(z.literal('')),
  priority: z.union([z.literal('high'), z.literal('medium'), z.literal('low')]),
  notes: z.string().max(1000).optional().or(z.literal('')),
  estimatedCost: z.number().min(0).optional(),
  tagNames: z.array(z.string()).default([]),
});

export type WishlistFormValues = z.infer<typeof wishlistFormSchema>;

export const WISHLIST_FORM_DEFAULTS: WishlistFormValues = {
  name: '',
  categoryId: '',
  address: '',
  lat: undefined,
  lng: undefined,
  googleMapsUrl: '',
  source: '',
  priority: 'medium',
  notes: '',
  estimatedCost: undefined,
  tagNames: [],
};

export const SOURCE_LABELS: Record<WishlistSource, string> = {
  facebook: 'Facebook',
  tiktok: 'TikTok',
  friend: 'Bạn bè giới thiệu',
  google: 'Google/Tìm kiếm',
  other: 'Khác',
};

export const PRIORITY_LABELS: Record<WishlistPriority, string> = {
  high: 'Rất muốn đi',
  medium: 'Muốn đi',
  low: 'Để sau cũng được',
};

export const PRIORITY_COLORS: Record<WishlistPriority, string> = {
  high: '#FF6B4A',
  medium: '#eab308',
  low: '#94a3b8',
};
