'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConvertForm } from '@/components/wishlist/convert-form';
import { convertWishlistToCheckin } from '@/lib/db/repositories/wishlist-repo';
import { addImages } from '@/lib/db/repositories/image-repo';
import { useToast } from '@/lib/hooks/use-toast';
import type { ConvertFormValues } from '@/lib/validation/convert-schema';
import type { WishlistPlaceWithMeta } from '@/types';

interface ConvertSheetProps {
  item: WishlistPlaceWithMeta | null;
  onOpenChange: (open: boolean) => void;
  /** Gọi sau khi chuyển đổi thành công, để trang Places tự chuyển qua tab "Đã ghé" */
  onConverted: () => void;
}

export function ConvertSheet({ item, onOpenChange, onConverted }: ConvertSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(values: ConvertFormValues, newImages: File[]) {
    if (!item?.id) return;
    setIsSubmitting(true);
    try {
      const newPlaceId = await convertWishlistToCheckin(item.id, {
        rating: values.rating,
        reviewText: values.reviewText || undefined,
        checkinDate: values.checkinDate,
        checkinTime: values.checkinTime || undefined,
        actualCost: values.actualCost,
        wouldReturn: values.wouldReturn,
        wouldRecommend: values.wouldRecommend,
      });

      if (newImages.length > 0) {
        await addImages(newPlaceId, newImages);
      }

      toast({ title: 'Đã trải nghiệm! 🎉', description: `"${item.name}" đã chuyển sang tab Đã ghé.` });
      onOpenChange(false);
      onConverted();
    } catch (err) {
      toast({
        title: 'Không chuyển đổi được',
        description: err instanceof Error ? err.message : 'Có lỗi xảy ra, thử lại nhé.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đánh dấu đã trải nghiệm</DialogTitle>
        </DialogHeader>
        {item && (
          <ConvertForm
            wishlistItem={item}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
