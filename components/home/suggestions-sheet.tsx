'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { DiscoverCard } from '@/components/home/discover-card';
import { useNearbyDiscovery } from '@/lib/hooks/use-nearby-discovery';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCurrentLocation } from '@/lib/hooks/use-current-location';
import { Compass } from 'lucide-react';
import type { RandomCandidate } from '@/types';

interface SuggestionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  radiusKm?: number;
}

/**
 * Widget "📍 Khám phá quanh bạn" — chỉ đọc dữ liệu đã có sẵn trong IndexedDB + vị trí
 * hiện tại, không gọi Internet, không tạo dữ liệu mới. Gộp 5 nhóm gợi ý theo đúng spec V4.
 */
export function SuggestionsSheet({ open, onOpenChange, radiusKm = 1 }: SuggestionsSheetProps) {
  const categories = useCategories();
  const currentLocation = useCurrentLocation();
  const groups = useNearbyDiscovery(radiusKm);

  const categoryEmoji = (id: string) => categories?.find((c) => c.id === id)?.emoji;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>📍 Khám phá quanh bạn</DialogTitle>
        </DialogHeader>

        {!groups.hasLocation ? (
          <EmptyState
            icon={Compass}
            title="Chưa lấy được vị trí"
            description="Cho phép truy cập vị trí để xem gợi ý quanh bạn."
          />
        ) : !groups.hasAnyData ? (
          <EmptyState
            icon={Compass}
            title="Hôm nay quanh bạn chưa có địa điểm nào đã lưu"
            description="Ghé một nơi mới và tạo check-in đầu tiên nhé."
          />
        ) : (
          <div className="space-y-6">
            {groups.smartPick && (
              <section className="space-y-2.5">
                <h3 className="text-label text-muted-foreground">🎲 Gợi ý hôm nay</h3>
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  <DiscoverCard
                    candidate={groups.smartPick}
                    categoryEmoji={categoryEmoji(groups.smartPick.categoryId)}
                    currentLocation={currentLocation}
                  />
                </div>
              </section>
            )}

            <DiscoverSection
              title="⭐ Wishlist gần bạn"
              items={groups.wishlistNearby}
              categoryEmoji={categoryEmoji}
              currentLocation={currentLocation}
            />
            <DiscoverSection
              title="❤️ Địa điểm yêu thích gần bạn"
              items={groups.favoritesNearby}
              categoryEmoji={categoryEmoji}
              currentLocation={currentLocation}
            />
            <DiscoverSection
              title="🕒 Đã lâu chưa ghé"
              items={groups.staleNearby}
              categoryEmoji={categoryEmoji}
              currentLocation={currentLocation}
            />
            <DiscoverSection
              title="🏆 Rating cao gần bạn"
              items={groups.topRatedNearby}
              categoryEmoji={categoryEmoji}
              currentLocation={currentLocation}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DiscoverSection({
  title,
  items,
  categoryEmoji,
  currentLocation,
}: {
  title: string;
  items: RandomCandidate[];
  categoryEmoji: (id: string) => string | undefined;
  currentLocation: { lat: number; lng: number } | null;
}) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-2.5">
      <h3 className="text-label text-muted-foreground">{title}</h3>
      <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
        {items.map((c) => (
          <DiscoverCard
            key={`${c.kind}:${c.id}`}
            candidate={c}
            categoryEmoji={categoryEmoji(c.categoryId)}
            currentLocation={currentLocation}
          />
        ))}
      </div>
    </section>
  );
}
