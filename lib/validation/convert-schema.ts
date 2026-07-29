import { z } from 'zod';

export const convertFormSchema = z.object({
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  reviewText: z.string().max(2000).optional().or(z.literal('')),
  checkinDate: z.string().min(1, 'Chọn ngày check-in'),
  checkinTime: z.string().optional().or(z.literal('')),
  actualCost: z.number().min(0).optional(),
  wouldReturn: z.boolean(),
  wouldRecommend: z.boolean(),
});

export type ConvertFormValues = z.infer<typeof convertFormSchema>;

export const CONVERT_FORM_DEFAULTS: ConvertFormValues = {
  rating: 5,
  reviewText: '',
  checkinDate: new Date().toISOString().slice(0, 10),
  checkinTime: new Date().toTimeString().slice(0, 5),
  actualCost: undefined,
  wouldReturn: true,
  wouldRecommend: true,
};
