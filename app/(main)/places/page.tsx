'use client';

import { useMemo, useState } from 'react';
import { LayoutGrid, Sparkles, Star } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { SearchBar } from '@/components/shared/search-bar';
import { EmptyState } from '@/components/shared/empty-state';
import { SegmentedTabs } from '@/components/shared/segmented-tabs';
import { PlaceCard } from '@/components/place/place-card';
import { PlaceListSkeleton } from '@/components/place/place-list-skeleton';
import { Fab } from '@/components/shared/fab';
import { CheckinSheet } from '@/components/checkin/checkin-sheet';
import { FilterSheet } from '@/components/shared/filter-sheet';
import { WishlistSheet } from '@/components/wishlist/wishlist-sheet';
import { WishlistCard } from '@/components/wishlist/wishlist-card';
import { ConvertSheet } from '@/components/wishlist/convert-sheet';
import { usePlaces } from '@/lib/hooks/use-places';
import { useWishlist } from '@/lib/hooks/use-wishlist';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCurrentLocation } from '@/lib/hooks/use-current-location';
import { usePagedList } from '@/lib/hooks/use-paged-list';
import { deleteWishlistItem } from '@/lib/db/repositories/wishlist-repo';
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  DEFAULT_NEAR_ME_RADIUS_KM,
  NEAR_ME_RADIUS_OPTIONS,
  useFilteredPlaces,
  type SortOption,
} from '@/lib/hooks/use-filtered-places';
import { useFilteredWishlist, type WishlistSortOption } from '@/lib/hooks/use-filtered-wishlist';
import { usePassingBy } from '@/lib/hooks/use-passing-by';
import { PassingByBanner } from '@/components/passing-by/passing-by-banner';
import { cn } from '@/lib/utils/cn';
import type { CategoryId, WishlistPlaceWithMeta } from '@/types';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'rating_desc', label: 'Rating cao nhất' },
  { value: 'name_asc', label: 'Tên A-Z' },
  { value: 'distance_asc', label: 'Gần nhất' },
  { value: 'stale_first', label: 'Đã lâu chưa ghé' },
];

const WISHLIST_SORT_OPTIONS: { value: WishlistSortOption; label: string }[] = [
  { value: 'added_desc', label: 'Mới thêm' },
  { value: 'priority', label: 'Ưu tiên' },
  { value: 'distance', label: 'Gần nhất' },
];

type PlacesTab = 'visited' | 'wishlist';

export default function PlacesPage() {
  const [tab, setTab] = useState<PlacesTab>('visited');
  const [query, setQuery] = useState('');

  // --- Đã ghé ---
  const [checkinSheetOpen, setCheckinSheetOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>('newest');
  const [worthReturningOnly, setWorthReturningOnly] = useState(false);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [nearMeRadiusKm, setNearMeRadiusKm] = useState(DEFAULT_NEAR_ME_RADIUS_KM);

  // --- Wishlist ---
  const [wishlistSheetOpen, setWishlistSheetOpen] = useState(false);
  const [wishlistCategoryIds, setWishlistCategoryIds] = useState<CategoryId[]>([]);
  const [wishlistSort, setWishlistSort] = useState<WishlistSortOption>('added_desc');
  const [convertingItem, setConvertingItem] = useState<WishlistPlaceWithMeta | null>(null);
  const [editingWishlistItem, setEditingWishlistItem] = useState<WishlistPlaceWithMeta | null>(null);

  const places = usePlaces();
  const wishlist = useWishlist();
  const categories = useCategories();
  const currentLocation = useCurrentLocation();
  const passingBy = usePassingBy();

  const categoryById = useMemo(() => new Map(categories?.map((c) => [c.id, c])), [categories]);

  const effectiveFilters = {
    ...filters,
    ...(worthReturningOnly
      ? { minRating: Math.max(filters.minRating, 4), wouldReturnOnly: true, wouldRecommendOnly: true }
      : {}),
    nearMeRadiusKm: nearMeActive ? nearMeRadiusKm : null,
  };

  const filteredPlaces = useFilteredPlaces(
    places,
    tab === 'visited' ? query : '',
    effectiveFilters,
    sort,
    currentLocation
  );
  const { visibleItems, sentinelRef, hasMore } = usePagedList(filteredPlaces, 30);
  const activeFilterCount = countActiveFilters(filters);

  const filteredWishlist = useFilteredWishlist(
    wishlist,
    tab === 'wishlist' ? query : '',
    wishlistCategoryIds,
    wishlistSort,
    currentLocation
  );

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-5 pt-6 lg:p-8 animate-fade-in">
      <PageHeader
        title="Địa điểm"
        subtitle={
          tab === 'visited'
            ? `${places?.length ?? 0} nơi đã check-in`
            : `${wishlist?.length ?? 0} nơi trong Wishlist`
        }
      />

      {passingBy.result && (
        <PassingByBanner data={passingBy.result} onDismiss={passingBy.dismiss} onHideToday={passingBy.hideForToday} />
      )}

      <SegmentedTabs
        value={tab}
        onChange={setTab}
        options={[
          { value: 'visited', label: '📍 Đã ghé', count: places?.length },
          { value: 'wishlist', label: '⭐ Muốn đi', count: wishlist?.length },
        ]}
      />

      <SearchBar
        value={query}
        onChange={setQuery}
        onFilterClick={tab === 'visited' ? () => setFilterOpen(true) : undefined}
        placeholder={tab === 'visited' ? 'Tìm địa điểm, món ăn, tag...' : 'Tìm trong Wishlist...'}
        className={cn(tab === 'visited' && activeFilterCount > 0 && 'ring-2 ring-primary/40')}
      />

      {tab === 'visited' ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setNearMeActive((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                nearMeActive
                  ? 'border-transparent bg-secondary text-secondary-foreground'
                  : 'border-border bg-card hover:bg-accent'
              )}
            >
              📍 Gần tôi
            </button>
            <button
              type="button"
              onClick={() => setWorthReturningOnly((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                worthReturningOnly
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:bg-accent'
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Đáng quay lại
            </button>
            <div className="ml-auto flex gap-1 overflow-x-auto">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSort(opt.value)}
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                    sort === opt.value ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {nearMeActive && (
            <div className="flex flex-wrap gap-1.5">
              {NEAR_ME_RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setNearMeRadiusKm(r)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                    nearMeRadiusKm === r
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-border bg-card hover:bg-accent'
                  )}
                >
                  {r < 1 ? `${r * 1000}m` : `${r}km`}
                </button>
              ))}
            </div>
          )}

          {places === undefined ? (
            <PlaceListSkeleton />
          ) : visibleItems && visibleItems.length > 0 ? (
            <div className="space-y-2.5">
              {visibleItems.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  category={categoryById.get(place.categoryId)}
                  currentLocation={currentLocation}
                />
              ))}
              {hasMore && <div ref={sentinelRef} className="h-6" />}
            </div>
          ) : (
            <EmptyState
              icon={LayoutGrid}
              title={query || activeFilterCount > 0 ? 'Không tìm thấy địa điểm nào' : 'Chưa có địa điểm nào'}
              description={
                query || activeFilterCount > 0
                  ? 'Thử từ khoá hoặc bộ lọc khác xem sao.'
                  : 'Bấm nút (+) ở góc màn hình để check-in nơi đầu tiên của bạn.'
              }
            />
          )}

          <Fab onClick={() => setCheckinSheetOpen(true)} />
          <CheckinSheet open={checkinSheetOpen} onOpenChange={setCheckinSheetOpen} />
          <FilterSheet open={filterOpen} onOpenChange={setFilterOpen} filters={filters} onChange={setFilters} />
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1.5">
              {categories?.map((cat) => {
                const active = wishlistCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    title={cat.label}
                    onClick={() =>
                      setWishlistCategoryIds((prev) =>
                        prev.includes(cat.id) ? prev.filter((c) => c !== cat.id) : [...prev, cat.id]
                      )
                    }
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                      active ? 'border-transparent text-white' : 'border-border bg-card hover:bg-accent'
                    )}
                    style={active ? { backgroundColor: cat.color } : undefined}
                  >
                    {cat.emoji}
                  </button>
                );
              })}
            </div>
            <div className="ml-auto flex gap-1 overflow-x-auto">
              {WISHLIST_SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setWishlistSort(opt.value)}
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                    wishlistSort === opt.value
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:bg-accent'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {wishlist === undefined ? (
            <PlaceListSkeleton />
          ) : filteredWishlist && filteredWishlist.length > 0 ? (
            <div className="space-y-2.5">
              {filteredWishlist.map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  category={categoryById.get(item.categoryId)}
                  currentLocation={currentLocation}
                  onMarkVisited={() => setConvertingItem(item)}
                  onEdit={() => setEditingWishlistItem(item)}
                  onDelete={() => item.id && deleteWishlistItem(item.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Star}
              title={query || wishlistCategoryIds.length > 0 ? 'Không tìm thấy mục nào' : 'Wishlist còn trống'}
              description={
                query || wishlistCategoryIds.length > 0
                  ? 'Thử từ khoá hoặc bộ lọc khác xem sao.'
                  : 'Lưu ngay những nơi bạn tình cờ thấy trên mạng xã hội để không quên.'
              }
            />
          )}

          <Fab onClick={() => setWishlistSheetOpen(true)} label="Thêm vào Wishlist" />
          <WishlistSheet open={wishlistSheetOpen} onOpenChange={setWishlistSheetOpen} />
          <WishlistSheet
            open={!!editingWishlistItem}
            onOpenChange={(open) => !open && setEditingWishlistItem(null)}
            editingItem={editingWishlistItem}
          />
          <ConvertSheet
            item={convertingItem}
            onOpenChange={(open) => !open && setConvertingItem(null)}
            onConverted={() => {
              setConvertingItem(null);
              setTab('visited');
            }}
          />
        </>
      )}
    </main>
  );
}
