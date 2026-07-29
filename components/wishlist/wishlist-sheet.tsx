'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WishlistForm } from '@/components/wishlist/wishlist-form';
import { createWishlistItem } from '@/lib/db/repositories/wishlist-repo';
import { addWishlistImages } from '@/lib/db/repositories/wishlist-image-repo';
import { useToast } from '@/lib/hooks/use-toast';
import type { WishlistFormValues } from '@/lib/validation/wishlist-schema';
import type { CategoryId, WishlistSource } from '@/types';

interface WishlistSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLatLng?: { lat: number; lng: number };
}

export function WishlistSheet({ open, onOpenChange, initialLatLng }: WishlistSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(values: WishlistFormValues, pendingImages: File[]) {
    setIsSubmitting(true);
    try {
      const id = await createWishlistItem({
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
      });

      if (pendingImages.length > 0) {
        await addWishlistImages(id, pendingImages);
      }

      toast({ title: 'Đã thêm vào Wishlist ⭐', description: `"${values.name}" — nhớ ghé thử nhé!` });
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
          <DialogTitle>Thêm vào Wishlist</DialogTitle>
        </DialogHeader>
        <WishlistForm
          initialLatLng={initialLatLng}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
