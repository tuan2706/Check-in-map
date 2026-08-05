'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WishlistForm } from '@/components/wishlist/wishlist-form';
import { createWishlistItem, updateWishlistItem } from '@/lib/db/repositories/wishlist-repo';
import { addWishlistImages } from '@/lib/db/repositories/wishlist-image-repo';
import { useToast } from '@/lib/hooks/use-toast';
import type { WishlistFormValues } from '@/lib/validation/wishlist-schema';
import type { CategoryId, WishlistPlaceWithMeta, WishlistSource } from '@/types';

interface WishlistSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLatLng?: { lat: number; lng: number };
  /** Nếu truyền vào -> mở ở chế độ Edit, điền sẵn dữ liệu cũ, lưu bằng update thay vì tạo mới */
  editingItem?: WishlistPlaceWithMeta | null;
}

export function WishlistSheet({ open, onOpenChange, initialLatLng, editingItem }: WishlistSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!editingItem;

  async function handleSubmit(values: WishlistFormValues, pendingImages: File[]) {
    setIsSubmitting(true);
    try {
      const changes = {
        name: values.name,
        categoryId: values.categoryId as CategoryId,
        address: values.address || undefined,
        lat: values.lat,
        lng: values.lng,
        googleMapsUrl: values.googleMapsUrl || undefined,
        source: (values.source || undefined) as WishlistSource | undefined,
        priority: values.priority,
        notes: values.notes || undefined,
        estimatedCost: values.estimatedCost,
        tagNames: values.tagNames,
      };

      if (isEditMode && editingItem?.id) {
        await updateWishlistItem(editingItem.id, changes);
        if (pendingImages.length > 0) {
          await addWishlistImages(editingItem.id, pendingImages);
        }
        toast({ title: 'Đã cập nhật! ✅', description: `"${values.name}" đã được lưu lại.` });
      } else {
        const id = await createWishlistItem(changes);
        if (pendingImages.length > 0) {
          await addWishlistImages(id, pendingImages);
        }
        toast({ title: 'Đã thêm vào Wishlist ⭐', description: `"${values.name}" — nhớ ghé thử nhé!` });
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
          <DialogTitle>{isEditMode ? 'Chỉnh sửa Wishlist' : 'Thêm vào Wishlist'}</DialogTitle>
        </DialogHeader>
        <WishlistForm
          initialLatLng={initialLatLng}
          defaultValues={
            editingItem
              ? {
                  name: editingItem.name,
                  categoryId: editingItem.categoryId,
                  address: editingItem.address ?? '',
                  lat: editingItem.lat,
                  lng: editingItem.lng,
                  googleMapsUrl: editingItem.googleMapsUrl ?? '',
                  source: editingItem.source ?? '',
                  priority: editingItem.priority,
                  notes: editingItem.notes ?? '',
                  estimatedCost: editingItem.estimatedCost,
                  tagNames: editingItem.tagNames,
                }
              : undefined
          }
          submitLabel={isEditMode ? 'Lưu thay đổi' : 'Lưu vào Wishlist'}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
