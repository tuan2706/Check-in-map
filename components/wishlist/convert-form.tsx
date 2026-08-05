'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Loader2, Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { StarRatingInput } from '@/components/checkin/star-rating-input';
import { AddressSearchInput } from '@/components/checkin/address-search-input';
import { ImageDropzone } from '@/components/gallery/image-dropzone';
import { PendingPhotoGrid } from '@/components/gallery/pending-photo-grid';
import {
  CONVERT_FORM_DEFAULTS,
  convertFormSchema,
  type ConvertFormValues,
} from '@/lib/validation/convert-schema';
import type { WishlistPlaceWithMeta } from '@/types';

const LocationPickerMap = dynamic(
  () => import('@/components/checkin/location-picker-map').then((m) => m.LocationPickerMap),
  { ssr: false, loading: () => <div className="h-52 w-full animate-pulse rounded-xl bg-muted" /> }
);

interface ConvertFormProps {
  wishlistItem: WishlistPlaceWithMeta;
  onSubmit: (values: ConvertFormValues, newImages: File[]) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ConvertForm({ wishlistItem, onSubmit, onCancel, isSubmitting }: ConvertFormProps) {
  const [newImages, setNewImages] = useState<File[]>([]);
  const [addressQuery, setAddressQuery] = useState(wishlistItem.address ?? '');
  const [flyToTick, setFlyToTick] = useState(0);
  const needsGps = wishlistItem.lat === undefined || wishlistItem.lng === undefined;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ConvertFormValues>({
    resolver: zodResolver(convertFormSchema),
    defaultValues: { ...CONVERT_FORM_DEFAULTS, actualCost: wishlistItem.estimatedCost },
  });

  const lat = watch('lat');
  const lng = watch('lng');
  const hasGps = lat !== undefined && lng !== undefined;

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setValue('lat', pos.coords.latitude);
      setValue('lng', pos.coords.longitude);
      setFlyToTick((t) => t + 1);
    });
  }

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values, newImages))} className="space-y-6">
      <p className="rounded-xl bg-accent px-3.5 py-2.5 text-caption text-muted-foreground">
        Toàn bộ thông tin cũ của <strong className="text-foreground">{wishlistItem.name}</strong> (địa
        chỉ, danh mục, tag, ảnh, ghi chú...) sẽ được giữ nguyên. Bạn chỉ cần bổ sung phần dưới đây.
      </p>

      {/* Chỉ hiện khi Wishlist gốc chưa có GPS — bổ sung 1 lần duy nhất, lưu luôn vào
          Wishlist để không phải hỏi lại nếu bạn quay lại chỉnh sửa sau này. */}
      {needsGps && (
        <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-3.5">
          <Label>📍 Địa điểm này chưa có toạ độ GPS — bổ sung để hoàn tất check-in</Label>
          <AddressSearchInput
            value={addressQuery}
            onChangeText={setAddressQuery}
            onSelectResult={(result) => {
              setAddressQuery(result.displayName);
              setValue('lat', result.lat);
              setValue('lng', result.lng);
              setFlyToTick((t) => t + 1);
            }}
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">
              {hasGps ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Chưa có toạ độ'}
            </span>
            <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
              <Locate className="mr-1.5 h-3.5 w-3.5" />
              Vị trí hiện tại
            </Button>
          </div>
          {hasGps && (
            <LocationPickerMap
              lat={lat}
              lng={lng}
              flyToTick={flyToTick}
              onChange={(newLat, newLng) => {
                setValue('lat', newLat);
                setValue('lng', newLng);
              }}
            />
          )}
          {(errors.lat || errors.lng) && !hasGps && (
            <p className="text-xs text-destructive">Cần bổ sung toạ độ trước khi xác nhận</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Đánh giá</Label>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => <StarRatingInput value={field.value} onChange={field.onChange} />}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cv-review">Review</Label>
        <Textarea id="cv-review" placeholder="Cảm nhận thực tế của bạn..." {...register('reviewText')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="cv-date">Ngày check-in</Label>
          <Input id="cv-date" type="date" {...register('checkinDate')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cv-time">Giờ</Label>
          <Input id="cv-time" type="time" {...register('checkinTime')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cv-cost">Chi phí thực tế (đ)</Label>
        <Input id="cv-cost" type="number" {...register('actualCost', { valueAsNumber: true })} />
        {errors.actualCost && <p className="text-xs text-destructive">{errors.actualCost.message}</p>}
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="cv-return">Có muốn quay lại không?</Label>
          <Controller
            control={control}
            name="wouldReturn"
            render={({ field }) => (
              <Switch id="cv-return" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="cv-recommend">Có recommend không?</Label>
          <Controller
            control={control}
            name="wouldRecommend"
            render={({ field }) => (
              <Switch id="cv-recommend" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Thêm ảnh mới (nếu có)</Label>
        <ImageDropzone onFilesSelected={(files) => setNewImages((prev) => [...prev, ...files])} />
        <PendingPhotoGrid files={newImages} onRemove={(i) => setNewImages((prev) => prev.filter((_, idx) => idx !== i))} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting || (needsGps && !hasGps)}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Xác nhận đã trải nghiệm
        </Button>
      </div>
    </form>
  );
}
