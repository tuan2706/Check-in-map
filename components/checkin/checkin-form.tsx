'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Locate, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { CategoryPicker } from '@/components/checkin/category-picker';
import { StarRatingInput } from '@/components/checkin/star-rating-input';
import { TagInput } from '@/components/checkin/tag-input';
import { AddressSearchInput } from '@/components/checkin/address-search-input';
import { ImageDropzone } from '@/components/gallery/image-dropzone';
import { PendingPhotoGrid } from '@/components/gallery/pending-photo-grid';
import { useCategories } from '@/lib/hooks/use-categories';
import {
  PLACE_FORM_DEFAULTS,
  placeFormSchema,
  type PlaceFormValues,
} from '@/lib/validation/place-schema';
import type { CategoryId } from '@/types';

// MapLibre cần DOM/window -> tắt SSR cho bản đồ nhỏ nhúng trong form
const LocationPickerMap = dynamic(
  () => import('@/components/checkin/location-picker-map').then((m) => m.LocationPickerMap),
  { ssr: false, loading: () => <div className="h-52 w-full animate-pulse rounded-xl bg-muted" /> }
);

interface CheckinFormProps {
  initialLatLng?: { lat: number; lng: number };
  /** Điền sẵn dữ liệu cũ khi Edit — không cần thì để trống (mặc định là Check-in mới) */
  defaultValues?: Partial<PlaceFormValues>;
  /** Ẩn phần upload ảnh khi Edit, vì ảnh đã quản lý riêng ở trang chi tiết địa điểm */
  hideImageSection?: boolean;
  submitLabel?: string;
  onSubmit: (values: PlaceFormValues, pendingImages: File[]) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CheckinForm({
  initialLatLng,
  defaultValues,
  hideImageSection = false,
  submitLabel = 'Lưu check-in',
  onSubmit,
  onCancel,
  isSubmitting,
}: CheckinFormProps) {
  const categories = useCategories();
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [flyToTick, setFlyToTick] = useState(0);
  const [addressQuery, setAddressQuery] = useState(defaultValues?.address ?? '');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlaceFormValues>({
    resolver: zodResolver(placeFormSchema),
    defaultValues: {
      ...PLACE_FORM_DEFAULTS,
      ...defaultValues,
      lat: defaultValues?.lat ?? initialLatLng?.lat ?? 0,
      lng: defaultValues?.lng ?? initialLatLng?.lng ?? 0,
    },
  });

  useEffect(() => {
    if (initialLatLng) {
      setValue('lat', initialLatLng.lat);
      setValue('lng', initialLatLng.lng);
      setFlyToTick((t) => t + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLatLng]);

  const lat = watch('lat');
  const lng = watch('lng');
  const hasGps = lat !== 0 || lng !== 0;

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setValue('lat', pos.coords.latitude);
      setValue('lng', pos.coords.longitude);
      setFlyToTick((t) => t + 1);
    });
  }

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, pendingImages))}
      className="space-y-6"
    >
      {/* Tên + danh mục */}
      <div className="space-y-2">
        <Label htmlFor="name">Tên địa điểm</Label>
        <Input id="name" placeholder="Vd: Phở Hòa Pasteur" {...register('name')} />
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

      {/* Địa chỉ — gõ để tự tìm toạ độ (Nominatim), chọn kết quả sẽ tự điền GPS + bay bản đồ tới */}
      <div className="space-y-2">
        <Label htmlFor="address">Địa chỉ</Label>
        <Controller
          control={control}
          name="address"
          render={({ field }) => (
            <AddressSearchInput
              value={addressQuery}
              onChangeText={(text) => {
                setAddressQuery(text);
                field.onChange(text);
              }}
              onSelectResult={(result) => {
                setAddressQuery(result.displayName);
                field.onChange(result.displayName);
                setValue('lat', result.lat);
                setValue('lng', result.lng);
                setFlyToTick((t) => t + 1);
              }}
            />
          )}
        />
      </div>

      {/* Bản đồ nhỏ + kéo marker chỉnh vị trí */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Vị trí trên bản đồ</Label>
          <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
            <Locate className="mr-1.5 h-3.5 w-3.5" />
            Vị trí hiện tại
          </Button>
        </div>
        <LocationPickerMap
          lat={lat}
          lng={lng}
          flyToTick={flyToTick}
          onChange={(newLat, newLng) => {
            setValue('lat', newLat);
            setValue('lng', newLng);
          }}
        />
        <p className="font-mono text-xs text-muted-foreground">
          {hasGps ? `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)} — kéo marker để chỉnh lại` : 'Chưa có toạ độ GPS'}
        </p>
        {(errors.lat || errors.lng) && (
          <p className="text-xs text-destructive">Cần có toạ độ GPS hợp lệ</p>
        )}
      </div>

      {/* Ngày giờ */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="checkinDate">Ngày</Label>
          <Input id="checkinDate" type="date" {...register('checkinDate')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkinTime">Giờ</Label>
          <Input id="checkinTime" type="time" {...register('checkinTime')} />
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <Label>Đánh giá</Label>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => <StarRatingInput value={field.value} onChange={field.onChange} />}
        />
      </div>

      {/* Review */}
      <div className="space-y-2">
        <Label htmlFor="reviewText">Review</Label>
        <Textarea id="reviewText" placeholder="Cảm nhận của bạn..." {...register('reviewText')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="recommendedDish">Món nên thử</Label>
          <Input id="recommendedDish" {...register('recommendedDish')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceRange">Giá tiền</Label>
          <Input id="priceRange" placeholder="Vd: 50-100k" {...register('priceRange')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weather">Thời tiết</Label>
        <Input id="weather" placeholder="Vd: Nắng đẹp, hơi nóng" {...register('weather')} />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tag</Label>
        <Controller
          control={control}
          name="tagNames"
          render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
        />
      </div>

      {/* Toggles */}
      <div className="space-y-3 rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="wouldReturn">Có muốn quay lại không?</Label>
          <Controller
            control={control}
            name="wouldReturn"
            render={({ field }) => (
              <Switch id="wouldReturn" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="wouldRecommend">Có recommend cho người khác không?</Label>
          <Controller
            control={control}
            name="wouldRecommend"
            render={({ field }) => (
              <Switch id="wouldRecommend" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
      </div>

      {/* Links */}
      <div className="space-y-3">
        <Label>Liên kết</Label>
        <Input placeholder="Link Google Maps" {...register('googleMapsUrl')} />
        {errors.googleMapsUrl && <p className="text-xs text-destructive">{errors.googleMapsUrl.message}</p>}
        <Input placeholder="Website" {...register('website')} />
        <Input placeholder="Facebook" {...register('facebook')} />
        <Input placeholder="Instagram" {...register('instagram')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="companions">Đi cùng ai</Label>
          <Input id="companions" {...register('companions')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost">Chi phí (đ)</Label>
          <Input id="cost" type="number" {...register('cost', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Ghi chú</Label>
        <Textarea id="notes" {...register('notes')} />
      </div>

      {/* Ảnh — ẩn khi Edit vì đã có mục quản lý ảnh riêng ở trang chi tiết */}
      {!hideImageSection && (
        <div className="space-y-3">
          <Label>Hình ảnh</Label>
          <ImageDropzone onFilesSelected={(files) => setPendingImages((prev) => [...prev, ...files])} />
          <PendingPhotoGrid
            files={pendingImages}
            onRemove={(index) => setPendingImages((prev) => prev.filter((_, i) => i !== index))}
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
