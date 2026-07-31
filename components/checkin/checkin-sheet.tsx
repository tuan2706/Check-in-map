'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckinForm } from '@/components/checkin/checkin-form';
import { createPlace, updatePlaceWithTags } from '@/lib/db/repositories/place-repo';
import { addImages } from '@/lib/db/repositories/image-repo';
import { useToast } from '@/lib/hooks/use-toast';
import type { PlaceFormValues } from '@/lib/validation/place-schema';
import type { CategoryId, PlaceWithRelations } from '@/types';

interface CheckinSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLatLng?: { lat: number; lng: number };
  /** Nếu truyền vào -> mở ở chế độ Edit, điền sẵn dữ liệu cũ, lưu bằng update thay vì tạo mới */
  editingPlace?: PlaceWithRelations | null;
}

/**
 * Bọc CheckinForm trong Dialog + xử lý lưu dữ liệu (tạo mới HOẶC chỉnh sửa).
 * Sau khi lưu thành công, useLiveQuery ở usePlaces() sẽ tự động thấy thay đổi
 * (không cần tự invalidate cache thủ công) — map, Timeline, thống kê tự cập nhật.
 */
export function CheckinSheet({ open, onOpenChange, initialLatLng, editingPlace }: CheckinSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!editingPlace;

  async function handleSubmit(values: PlaceFormValues, pendingImages: File[]) {
    setIsSubmitting(true);
    try {
      const placeChanges = {
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
      };

      if (isEditMode && editingPlace?.id) {
        await updatePlaceWithTags(editingPlace.id, placeChanges, values.tagNames);
        toast({ title: 'Đã cập nhật! ✅', description: `"${values.name}" đã được lưu lại.` });
      } else {
        const placeId = await createPlace({ ...placeChanges, tagNames: values.tagNames });

        if (pendingImages.length > 0) {
          // Nén + lưu ảnh chạy SAU khi đã có placeId, không chặn việc hiển thị marker mới
          await addImages(placeId, pendingImages);
        }

        toast({ title: 'Đã lưu check-in! 🎉', description: `"${values.name}" đã được thêm vào bản đồ.` });
      }

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
          <DialogTitle>{isEditMode ? 'Chỉnh sửa địa điểm' : 'Check-in địa điểm mới'}</DialogTitle>
        </DialogHeader>
        <CheckinForm
          initialLatLng={initialLatLng}
          defaultValues={
            editingPlace
              ? {
                  name: editingPlace.name,
                  categoryId: editingPlace.categoryId,
                  address: editingPlace.address ?? '',
                  lat: editingPlace.lat,
                  lng: editingPlace.lng,
                  checkinDate: editingPlace.checkinDate,
                  checkinTime: editingPlace.checkinTime ?? '',
                  rating: editingPlace.rating,
                  reviewText: editingPlace.reviewText ?? '',
                  recommendedDish: editingPlace.recommendedDish ?? '',
                  priceRange: editingPlace.priceRange ?? '',
                  weather: editingPlace.weather ?? '',
                  wouldReturn: editingPlace.wouldReturn,
                  wouldRecommend: editingPlace.wouldRecommend,
                  googleMapsUrl: editingPlace.googleMapsUrl ?? '',
                  website: editingPlace.website ?? '',
                  facebook: editingPlace.facebook ?? '',
                  instagram: editingPlace.instagram ?? '',
                  companions: editingPlace.companions ?? '',
                  cost: editingPlace.cost,
                  notes: editingPlace.notes ?? '',
                  tagNames: editingPlace.tags.map((t) => t.name),
                }
              : undefined
          }
          hideImageSection={isEditMode}
          submitLabel={isEditMode ? 'Lưu thay đổi' : 'Lưu check-in'}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
