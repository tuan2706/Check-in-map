'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { SearchBar } from '@/components/shared/search-bar';
import { Fab } from '@/components/shared/fab';
import { CheckinSheet } from '@/components/checkin/checkin-sheet';
import { SuggestionsSheet } from '@/components/home/suggestions-sheet';
import { useWishlist } from '@/lib/hooks/use-wishlist';

const PlaceMap = dynamic(() => import('@/components/map/place-map').then((m) => m.PlaceMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
      Đang tải bản đồ...
    </div>
  ),
});

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [initialLatLng, setInitialLatLng] = useState<{ lat: number; lng: number } | undefined>();
  const wishlist = useWishlist();

  function openCheckin(latLng?: { lat: number; lng: number }) {
    setInitialLatLng(latLng);
    setSheetOpen(true);
  }

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <PlaceMap onMapClickEmpty={openCheckin} />

      <div className="absolute inset-x-4 top-4 z-20 flex items-center gap-2 sm:inset-x-6 sm:top-6 lg:left-6 lg:right-auto lg:w-[420px]">
        <SearchBar value={query} onChange={setQuery} onFilterClick={() => {}} className="flex-1" />
      </div>

      {wishlist && wishlist.length > 0 && (
        <button
          onClick={() => setSuggestionsOpen(true)}
          className="absolute bottom-24 left-4 z-20 flex items-center gap-1.5 rounded-full border border-border bg-card/95 px-3.5 py-2 text-xs font-medium shadow-md shadow-black/5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg lg:bottom-8"
        >
          <Lightbulb className="h-3.5 w-3.5 text-primary" />
          Gợi ý cho bạn
        </button>
      )}

      <Fab onClick={() => openCheckin(undefined)} />

      <CheckinSheet open={sheetOpen} onOpenChange={setSheetOpen} initialLatLng={initialLatLng} />
      <SuggestionsSheet open={suggestionsOpen} onOpenChange={setSuggestionsOpen} />
    </main>
  );
}
