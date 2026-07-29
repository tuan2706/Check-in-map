'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Locate, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CategoryPicker } from '@/components/checkin/category-picker';
import { TagInput } from '@/components/checkin/tag-input';
import { ImageDropzone } from '@/components/gallery/image-dropzone';
import { PendingPhotoGrid } from '@/components/gallery/pending-photo-grid';
import { useCategories } from '@/lib/hooks/use-categories';
import {
  PRIORITY_LABELS,
  SOURCE_LABELS,
  WISHLIST_FORM_DEFAULTS,
  wishlistFormSchema,
  type WishlistFormValues,
} from '@/lib/validation/wishlist-schema';
import { cn } from '@/lib/utils/cn';
import type { CategoryId, WishlistPriority, WishlistSource } from '@/types';

interface WishlistFormProps {
  initialLatLng?: { lat: number; lng: number };
  onSubmit: (values: WishlistFormValues, pendingImages: File[]) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function WishlistForm({ initialLatLng, onSubmit, onCancel, isSubmitting }: WishlistFormProps) {
  const categories = useCategories();
  const [pendingImages, setPendingImages] = useState<File[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WishlistFormValues>({
    resolver: zodResolver(wishlistFormSchema),
    defaultValues: {
      ...WISHLIST_FORM_DEFAULTS,
      lat: initialLatLng?.lat,
      lng: initialLatLng?.lng,
    },
  });

  const lat = watch('lat');
  const lng = watch('lng');

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setValue('lat', pos.coords.latitude);
      setValue('lng', pos.coords.longitude);
    });
  }

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values, pendingImages))} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="wl-name">Tên địa điểm</Label>
        <Input id="wl-name" placeholder="Vd: Quán cafe view sông ở Đà Lạt" {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Danh mục</Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <CategoryPicker
              categories={categories ?? []}
              value={field.value as CategoryId | ''}
              onChange={field.onChange}
            />
          )}
        />
        {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="wl-address">Địa chỉ</Label>
        <Input id="wl-address" placeholder="Có thể để trống nếu chưa rõ" {...register('address')} />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2.5">
        <div className="font-mono text-xs text-muted-foreground">
          {lat !== undefined && lng !== undefined ? (
            <span>
              📍 {lat.toFixed(5)}, {lng.toFixed(5)}
            </span>
          ) : (
            <span>Chưa có GPS (không bắt buộc)</span>
          )}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
          <Locate className="mr-1.5 h-3.5 w-3.5" />
          Vị trí hiện tại
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="wl-gmaps">Link Google Maps</Label>
        <Input id="wl-gmaps" placeholder="Dán link để lưu vị trí chính xác" {...register('googleMapsUrl')} />
        {errors.googleMapsUrl && <p className="text-xs text-destructive">{errors.googleMapsUrl.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Mức độ muốn đi</Label>
        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <div className="flex gap-2">
              {(Object.keys(PRIORITY_LABELS) as WishlistPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => field.onChange(p)}
                  className={cn(
                    'flex-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors',
                    field.value === p
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card hover:bg-accent'
                  )}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Biết đến từ đâu?</Label>
        <Controller
          control={control}
          name="source"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SOURCE_LABELS) as WishlistSource[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => field.onChange(s)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    field.value === s
                      ? 'border-transparent bg-secondary text-secondary-foreground'
                      : 'border-border bg-card hover:bg-accent'
                  )}
                >
                  {SOURCE_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wl-cost">Ước tính chi phí (đ)</Label>
        <Input id="wl-cost" type="number" {...register('estimatedCost', { valueAsNumber: true })} />
      </div>

      <div className="space-y-2">
        <Label>Tag</Label>
        <Controller
          control={control}
          name="tagNames"
          render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wl-notes">Ghi chú cá nhân</Label>
        <Textarea id="wl-notes" placeholder="Vd: bạn A nói view đẹp, nhớ đi lúc hoàng hôn" {...register('notes')} />
      </div>

      <div className="space-y-3">
        <Label>Hình ảnh</Label>
        <ImageDropzone onFilesSelected={(files) => setPendingImages((prev) => [...prev, ...files])} />
        <PendingPhotoGrid
          files={pendingImages}
          onRemove={(index) => setPendingImages((prev) => prev.filter((_, i) => i !== index))}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu vào Wishlist
        </Button>
      </div>
    </form>
  );
}
