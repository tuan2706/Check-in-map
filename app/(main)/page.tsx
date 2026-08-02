'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Compass, Dices } from 'lucide-react';
import { SearchToggle } from '@/components/home/search-toggle';
import { SpeedDialFab } from '@/components/home/speed-dial-fab';
import { CheckinSheet } from '@/components/checkin/checkin-sheet';
import { WishlistSheet } from '@/components/wishlist/wishlist-sheet';
import { SuggestionsSheet } from '@/components/home/suggestions-sheet';
import { SpinSheet } from '@/components/random/spin-sheet';
import { PassingByBanner } from '@/components/passing-by/passing-by-banner';
import { usePassingBy } from '@/lib/hooks/use-passing-by';

const PlaceMap = dynamic(() => import('@/components/map/place-map').then((m) => m.PlaceMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
      Đang tải bản đồ...
    </div>
  ),
});

/**
 * Version 5 — Home Screen redesign: Progressive Disclosure. Bản đồ chiếm ~90% màn hình,
 * mọi chức năng phụ (search, gợi ý, random, tạo mới) chỉ là 1 icon nhỏ, mở ra khi cần.
 */
export default function HomePage() {
  const [query, setQuery] = useState('');
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [spinOpen, setSpinOpen] = useState(false);
  const [initialLatLng, setInitialLatLng] = useState<{ lat: number; lng: number } | undefined>();
  const passingBy = usePassingBy();

  function openCheckin(latLng?: { lat: number; lng: number }) {
    setInitialLatLng(latLng);
    setCheckinOpen(true);
  }

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <PlaceMap onMapClickEmpty={openCheckin} />

      {/* Góc trên trái: chỉ 1 icon Search, thu gọn mặc định */}
      <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
        <SearchToggle value={query} onChange={setQuery} />
      </div>

      {passingBy.result && (
        <div className="absolute inset-x-4 top-16 z-20 sm:inset-x-6 sm:top-20">
          <PassingByBanner
            data={passingBy.result}
            onDismiss={passingBy.dismiss}
            onHideToday={passingBy.hideForToday}
            onRandomNearby={() => setSpinOpen(true)}
          />
        </div>
      )}

      {/* Cụm 2 icon khám phá — đặt lệch trái, gần tầm ngón cái tay phải cầm máy */}
      <div className="absolute bottom-24 left-5 z-20 flex gap-2.5 lg:bottom-8">
        <button
          onClick={() => setSuggestionsOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card/95 shadow-md shadow-black/5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
          aria-label="Khám phá quanh bạn"
        >
          <Compass className="h-5 w-5 text-primary" />
        </button>
        <button
          onClick={() => setSpinOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card/95 shadow-md shadow-black/5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
          aria-label="Hôm nay đi đâu?"
        >
          <Dices className="h-5 w-5 text-primary" />
        </button>
      </div>

      <SpeedDialFab onCheckin={() => openCheckin(undefined)} onWishlist={() => setWishlistOpen(true)} />

      <CheckinSheet open={checkinOpen} onOpenChange={setCheckinOpen} initialLatLng={initialLatLng} />
      <WishlistSheet open={wishlistOpen} onOpenChange={setWishlistOpen} />
      <SuggestionsSheet open={suggestionsOpen} onOpenChange={setSuggestionsOpen} />
      <SpinSheet open={spinOpen} onOpenChange={setSpinOpen} />
    </main>
  );
}
