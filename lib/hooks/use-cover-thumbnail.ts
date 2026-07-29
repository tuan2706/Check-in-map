import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';

/** Chỉ đọc thumbnail của ảnh bìa — nhẹ hơn nhiều so với tải cả gallery cho mỗi card trong danh sách */
export function useCoverThumbnail(coverImageId: number | undefined): string | undefined {
  const image = useLiveQuery(async () => {
    if (coverImageId === undefined) return undefined;
    return db.images.get(coverImageId);
  }, [coverImageId]);

  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!image) {
      setUrl(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(image.thumbnailBlob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  return url;
}
