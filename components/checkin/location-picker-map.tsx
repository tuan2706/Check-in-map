'use client';

import { useEffect, useRef, useState } from 'react';
import MapGL, { Marker, type MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_STYLES } from '@/lib/map/map-styles';

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  /** Đổi giá trị này (vd Date.now()) mỗi khi muốn ép bản đồ bay tới lat/lng mới,
   *  kể cả khi lat/lng trùng với vị trí trước đó. */
  flyToTick?: number;
  onChange: (lat: number, lng: number) => void;
}

const HAS_GPS_ZOOM = 16;
const DEFAULT_ZOOM = 12;

/**
 * Bản đồ nhỏ nhúng trong form — cho phép kéo marker để tinh chỉnh vị trí chính xác
 * sau khi geocoding (V4.2) hoặc khi bấm "Vị trí hiện tại". Dùng chung style "light"
 * đơn giản, không cần bộ chuyển đổi Sáng/Tối/Vệ tinh như bản đồ chính.
 */
export function LocationPickerMap({ lat, lng, flyToTick, onChange }: LocationPickerMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const hasGps = lat !== 0 || lng !== 0;
  const [viewState, setViewState] = useState({
    longitude: lng || 106.700424,
    latitude: lat || 10.776889,
    zoom: hasGps ? HAS_GPS_ZOOM : DEFAULT_ZOOM,
  });

  useEffect(() => {
    if (!hasGps) return;
    mapRef.current?.flyTo({ center: [lng, lat], zoom: HAS_GPS_ZOOM, duration: 800 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyToTick]);

  return (
    <div className="h-52 w-full overflow-hidden rounded-xl border border-border">
      <MapGL
        ref={mapRef}
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        mapStyle={MAP_STYLES.light}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {hasGps && (
          <Marker
            longitude={lng}
            latitude={lat}
            anchor="bottom"
            draggable
            onDragEnd={(e) => {
              const lngLat = e.target.getLngLat();
              onChange(lngLat.lat, lngLat.lng);
            }}
          >
            <div className="flex h-8 w-8 -translate-y-1 items-center justify-center">
              <div className="h-4 w-4 rounded-full border-2 border-white bg-primary shadow-md" />
            </div>
          </Marker>
        )}
      </MapGL>
      <p className="sr-only">Kéo marker để tinh chỉnh vị trí chính xác</p>
    </div>
  );
}
