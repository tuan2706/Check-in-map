import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import type { RandomCandidate } from '@/types';

export function useCandidateThumbnail(candidate: RandomCandidate | null): string | undefined {
  const image = useLiveQuery(async () => {
    if (!candidate?.coverImageId) return undefined;
    return candidate.kind === 'place'
      ? db.images.get(candidate.coverImageId)
      : db.wishlistImages.get(candidate.coverImageId);
  }, [candidate?.kind, candidate?.coverImageId]);

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
