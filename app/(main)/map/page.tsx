'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Fab } from '@/components/shared/fab';
import { CheckinSheet } from '@/components/checkin/checkin-sheet';

const PlaceMap = dynamic(() => import('@/components/map/place-map').then((m) => m.PlaceMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
      Đang tải bản đồ...
    </div>
  ),
});

export default function MapPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [initialLatLng, setInitialLatLng] = useState<{ lat: number; lng: number } | undefined>();

  function openCheckin(latLng?: { lat: number; lng: number }) {
    setInitialLatLng(latLng);
    setSheetOpen(true);
  }

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <PlaceMap onMapClickEmpty={openCheckin} />
      <Fab onClick={() => openCheckin(undefined)} />
      <CheckinSheet open={sheetOpen} onOpenChange={setSheetOpen} initialLatLng={initialLatLng} />
    </main>
  );
}
