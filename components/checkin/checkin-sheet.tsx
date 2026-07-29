'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckinForm } from '@/components/checkin/checkin-form';
import { createPlace } from '@/lib/db/repositories/place-repo';
import { addImages } from '@/lib/db/repositories/image-repo';
import { useToast } from '@/lib/hooks/use-toast';
import type { PlaceFormValues } from '@/lib/validation/place-schema';
import type { CategoryId } from '@/types';

interface CheckinSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLatLng?: { lat: number; lng: number };
}

/**
 * Bọc CheckinForm trong Dialog + xử lý lưu dữ liệu.
 * Sau khi lưu thành công, useLiveQuery ở usePlaces() sẽ tự động thấy địa điểm mới
 * (không cần tự invalidate cache thủ công) — map và danh sách Places tự cập nhật.
 */
export function CheckinSheet({ open, onOpenChange, initialLatLng }: CheckinSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(values: PlaceFormValues, pendingImages: File[]) {
    setIsSubmitting(true);
    try {
      const placeId = await createPlace({
        name: values.name,
        categoryId: values.categoryId as CategoryId,
        address: values.address || undefined,
        lat: values.lat,
        lng: values.lng,
        checkinDate: values.checkinDate,
        checkinTime: values.checkinTime || undefined,
        rating: values.rating,
        reviewText: values.reviewText || undefined,
        recommendedDish: values.recommendedDish || undefined,
        priceRange: values.priceRange || undefined,
        weather: values.weather || undefined,
        wouldReturn: values.wouldReturn,
        wouldRecommend: values.wouldRecommend,
        googleMapsUrl: values.googleMapsUrl || undefined,
        website: values.website || undefined,
        facebook: values.facebook || undefined,
        instagram: values.instagram || undefined,
        companions: values.companions || undefined,
        cost: values.cost,
        notes: values.notes || undefined,
        tagNames: values.tagNames,
      });

      if (pendingImages.length > 0) {
        // Nén + lưu ảnh chạy SAU khi đã có placeId, không chặn việc hiển thị marker mới
        // trên bản đồ — nếu nén ảnh chậm (nhiều ảnh), người dùng vẫn thấy check-in đã lưu.
        await addImages(placeId, pendingImages);
      }

      toast({ title: 'Đã lưu check-in! 🎉', description: `"${values.name}" đã được thêm vào bản đồ.` });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: 'Không lưu được',
        description: err instanceof Error ? err.message : 'Có lỗi xảy ra, thử lại nhé.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check-in địa điểm mới</DialogTitle>
        </DialogHeader>
        <CheckinForm
          initialLatLng={initialLatLng}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
