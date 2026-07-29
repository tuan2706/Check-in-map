import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';

export interface PlaceImageWithUrl {
  id: number;
  placeId: number;
  order: number;
  url: string;
  thumbnailUrl: string;
}

/**
 * useLiveQuery đọc metadata ảnh từ Dexie (tự cập nhật khi có ảnh mới/xoá/đổi thứ tự).
 * Object URL (Blob -> URL) được tạo/thu hồi riêng trong useEffect vì đây là side-effect
 * của trình duyệt, không nên tính lại mỗi lần re-render — nếu không sẽ rò rỉ bộ nhớ
 * (mỗi createObjectURL không được revoke sẽ giữ Blob trong RAM cho đến khi tải lại trang).
 */
export function useImages(placeId: number | undefined): PlaceImageWithUrl[] {
  const rawImages = useLiveQuery(async () => {
    if (placeId === undefined) return [];
    return db.images.where('placeId').equals(placeId).sortBy('order');
  }, [placeId]);

  const [images, setImages] = useState<PlaceImageWithUrl[]>([]);

  useEffect(() => {
    if (!rawImages) return;

    const withUrls = rawImages.map((img) => ({
      id: img.id as number,
      placeId: img.placeId,
      order: img.order,
      url: URL.createObjectURL(img.blob),
      thumbnailUrl: URL.createObjectURL(img.thumbnailBlob),
    }));

    setImages(withUrls);

    return () => {
      withUrls.forEach((img) => {
        URL.revokeObjectURL(img.url);
        URL.revokeObjectURL(img.thumbnailUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawImages]);

  return images;
}
