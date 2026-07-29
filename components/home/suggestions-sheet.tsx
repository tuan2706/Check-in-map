'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WishlistMiniCard } from '@/components/wishlist/wishlist-mini-card';
import { useWishlist } from '@/lib/hooks/use-wishlist';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCurrentLocation } from '@/lib/hooks/use-current-location';
import { useWeekendSuggestions } from '@/lib/hooks/use-weekend-suggestions';

interface SuggestionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuggestionsSheet({ open, onOpenChange }: SuggestionsSheetProps) {
  const router = useRouter();
  const wishlist = useWishlist();
  const categories = useCategories();
  const currentLocation = useCurrentLocation();
  const weekendPicks = useWeekendSuggestions(wishlist, currentLocation, 5);

  const recentlyAdded = [...(wishlist ?? [])].sort((a, b) => b.addedAt - a.addedAt).slice(0, 5);
  const categoryEmoji = (id: string) => categories?.find((c) => c.id === id)?.emoji;

  function goToWishlist() {
    onOpenChange(false);
    router.push('/places');
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gợi ý cho bạn</DialogTitle>
          </DialogHeader>
          <p className="text-body text-muted-foreground">
            Wishlist của bạn đang trống. Thêm vài nơi bạn muốn đi để nhận gợi ý ở đây nhé.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gợi ý cho bạn</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {weekendPicks.length > 0 && (
            <section className="space-y-2.5">
              <h3 className="text-label text-muted-foreground">Có thể đi cuối tuần này</h3>
              <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
                {weekendPicks.map((item) => (
                  <WishlistMiniCard
                    key={item.id}
                    item={item}
                    categoryEmoji={categoryEmoji(item.categoryId)}
                    onClick={goToWishlist}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-2.5">
            <h3 className="text-label text-muted-foreground">Gần đây thêm vào Wishlist</h3>
            <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
              {recentlyAdded.map((item) => (
                <WishlistMiniCard
                  key={item.id}
                  item={item}
                  categoryEmoji={categoryEmoji(item.categoryId)}
                  onClick={goToWishlist}
                />
              ))}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
