'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Facebook,
  Globe,
  Heart,
  Instagram,
  Map as MapIcon,
  Trash2,
  Utensils,
  Wallet,
} from 'lucide-react';
import { RatingStamp } from '@/components/place/rating-stamp';
import { CategoryBadge } from '@/components/place/category-badge';
import { PhotoGrid } from '@/components/gallery/photo-grid';
import { ImageDropzone } from '@/components/gallery/image-dropzone';
import { Button } from '@/components/ui/button';
import { usePlace } from '@/lib/hooks/use-places';
import { useImages } from '@/lib/hooks/use-images';
import { useCategories } from '@/lib/hooks/use-categories';
import { addImages } from '@/lib/db/repositories/image-repo';
import { deletePlace, toggleFavorite } from '@/lib/db/repositories/place-repo';
import { useToast } from '@/lib/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

export default function PlaceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const placeId = Number(params.id);

  const place = usePlace(placeId);
  const images = useImages(placeId);
  const categories = useCategories();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const category = useMemo(
    () => categories?.find((c) => c.id === place?.categoryId),
    [categories, place]
  );

  if (place === undefined) {
    return <main className="p-8 text-center text-sm text-muted-foreground">Đang tải...</main>;
  }

  if (!place) {
    return (
      <main className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Không tìm thấy địa điểm này.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push('/places')}>
          Về danh sách
        </Button>
      </main>
    );
  }

  async function handleDelete() {
    if (!place) return;
    setConfirmingDelete(false);
    router.push('/places');

    let undone = false;
    const timeoutId = setTimeout(() => {
      if (!undone) void deletePlace(placeId);
    }, 5000);

    toast({
      title: 'Đã xoá địa điểm',
      description: `"${place.name}" sẽ bị xoá vĩnh viễn sau vài giây.`,
      action: (
        <ToastAction
          altText="Hoàn tác"
          onClick={() => {
            undone = true;
            clearTimeout(timeoutId);
          }}
        >
          Hoàn tác
        </ToastAction>
      ),
    });
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-5 pb-24 pt-5 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </button>
        <button
          onClick={() => toggleFavorite(placeId, place.isFavorite)}
          className="rounded-full p-2 hover:bg-accent"
          aria-label="Yêu thích"
        >
          <Heart
            className="h-5 w-5"
            fill={place.isFavorite ? '#ef4444' : 'none'}
            color={place.isFavorite ? '#ef4444' : 'currentColor'}
          />
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <RatingStamp rating={place.rating} size="lg" showLabel />
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="text-h1">{place.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {category && <CategoryBadge category={category} />}
            <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {place.checkinDate} {place.checkinTime}
            </span>
          </div>
          {place.address && <p className="mt-2 text-sm text-muted-foreground">{place.address}</p>}
        </div>
      </div>

      {/* Gallery */}
      <section className="space-y-3">
        <h2 className="text-label text-muted-foreground">Hình ảnh ({images.length})</h2>
        <PhotoGrid placeId={placeId} images={images} coverImageId={place.coverImageId} />
        <ImageDropzone onFilesSelected={(files) => addImages(placeId, files)} />
      </section>

      {/* Review */}
      {place.reviewText && (
        <section className="space-y-2">
          <h2 className="text-label text-muted-foreground">Review</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{place.reviewText}</p>
        </section>
      )}

      {place.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {place.tags.map((tag) => (
            <span key={tag.id} className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary">
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Thông tin thêm */}
      <section className="grid grid-cols-2 gap-3">
        {place.recommendedDish && (
          <InfoRow icon={Utensils} label="Món nên thử" value={place.recommendedDish} />
        )}
        {place.priceRange && <InfoRow icon={Wallet} label="Giá tiền" value={place.priceRange} />}
        {place.cost !== undefined && (
          <InfoRow icon={Wallet} label="Chi phí" value={`${place.cost.toLocaleString('vi-VN')}đ`} />
        )}
        {place.companions && <InfoRow icon={Heart} label="Đi cùng" value={place.companions} />}
      </section>

      <div className="flex gap-3 text-sm">
        <Badge active={place.wouldReturn} label="Muốn quay lại" />
        <Badge active={place.wouldRecommend} label="Recommend" />
      </div>

      {place.notes && (
        <section className="space-y-2">
          <h2 className="text-label text-muted-foreground">Ghi chú</h2>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{place.notes}</p>
        </section>
      )}

      {/* Links */}
      {(place.googleMapsUrl || place.website || place.facebook || place.instagram) && (
        <section className="flex flex-wrap gap-2">
          {place.googleMapsUrl && <LinkChip href={place.googleMapsUrl} icon={MapIcon} label="Google Maps" />}
          {place.website && <LinkChip href={place.website} icon={Globe} label="Website" />}
          {place.facebook && <LinkChip href={place.facebook} icon={Facebook} label="Facebook" />}
          {place.instagram && <LinkChip href={place.instagram} icon={Instagram} label="Instagram" />}
        </section>
      )}

      {/* Xoá */}
      <div className="border-t border-border pt-5">
        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="flex items-center gap-1.5 text-sm text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Xoá địa điểm này
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <span>Chắc chắn xoá? Không thể hoàn tác.</span>
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              Xoá
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConfirmingDelete(false)}>
              Huỷ
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Utensils; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function Badge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 font-medium ${
        active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
      }`}
    >
      {active ? '✓' : '✕'} {label}
    </span>
  );
}

function LinkChip({ href, icon: Icon, label }: { href: string; icon: typeof Globe; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </a>
  );
}
