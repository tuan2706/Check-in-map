'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MapGL, {
  AttributionControl,
  GeolocateControl,
  Layer,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
  type MapLayerMouseEvent,
  type MapRef,
} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { GeoJSONSource } from 'maplibre-gl';
import { cn } from '@/lib/utils/cn';
import { MAP_STYLES, type MapStyleKey } from '@/lib/map/map-styles';
import { MapStyleSwitcher } from '@/components/map/map-style-switcher';
import { MapVisibilityFilter, type MapVisibility } from '@/components/map/map-visibility-filter';
import { WishlistMarkerPin } from '@/components/map/wishlist-marker-pin';
import { PlaceInfoContent } from '@/components/map/place-info-content';
import { WishlistInfoContent } from '@/components/map/wishlist-info-content';
import { placesToGeoJSON, type PlaceFeatureProps } from '@/lib/map/places-to-geojson';
import { usePlaces } from '@/lib/hooks/use-places';
import { useWishlist } from '@/lib/hooks/use-wishlist';
import { useCategories } from '@/lib/hooks/use-categories';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import { useCurrentLocation } from '@/lib/hooks/use-current-location';
import { createCircleGeoJSON } from '@/lib/map/circle-geojson';
import { NEAR_ME_RADIUS_OPTIONS, DEFAULT_NEAR_ME_RADIUS_KM } from '@/lib/hooks/use-filtered-places';
import type { WishlistPlaceWithMeta } from '@/types';

const DEFAULT_VIEW = { longitude: 106.700424, latitude: 10.776889, zoom: 11 }; // TP.HCM mặc định

interface PlaceMapProps {
  onMapClickEmpty?: (lngLat: { lat: number; lng: number }) => void;
  className?: string;
}

export function PlaceMap({ onMapClickEmpty, className }: PlaceMapProps) {
  const places = usePlaces();
  const wishlist = useWishlist();
  const categories = useCategories();
  const isMobile = useIsMobile();
  const [styleKey, setStyleKey] = useState<MapStyleKey>('light');
  const [visibility, setVisibility] = useState<MapVisibility>('all');
  const [selected, setSelected] = useState<(PlaceFeatureProps & { lng: number; lat: number }) | null>(
    null
  );
  const [selectedWishlist, setSelectedWishlist] = useState<WishlistPlaceWithMeta | null>(null);
  const [mapRef, setMapRef] = useState<MapRef | null>(null);
  const selectedFeatureIdRef = useRef<number | null>(null);
  const currentLocation = useCurrentLocation();
  const [nearMeActive, setNearMeActive] = useState(false);
  const [nearMeRadiusKm, setNearMeRadiusKm] = useState(DEFAULT_NEAR_ME_RADIUS_KM);

  const categoryEmojiById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categories ?? []) map[c.id] = c.emoji;
    return map;
  }, [categories]);

  const showVisited = visibility === 'all' || visibility === 'visited';
  const showWishlist = visibility === 'all' || visibility === 'wishlist';

  const geojson = useMemo(
    () => placesToGeoJSON(showVisited ? places ?? [] : [], categoryEmojiById, currentLocation),
    [places, categoryEmojiById, showVisited, currentLocation]
  );

  const circleGeojson = useMemo(() => {
    if (!nearMeActive || !currentLocation) return null;
    return createCircleGeoJSON(currentLocation, nearMeRadiusKm);
  }, [nearMeActive, currentLocation, nearMeRadiusKm]);

  const wishlistWithCoords = useMemo(
    () => (showWishlist ? (wishlist ?? []).filter((w) => w.lat !== undefined && w.lng !== undefined) : []),
    [wishlist, showWishlist]
  );

  /** Cập nhật feature-state "selected" trên MapLibre để circle-radius tự animate (V4.3) */
  const setSelectedFeature = useCallback(
    (id: number | null) => {
      const map = mapRef?.getMap();
      if (!map) return;
      try {
        if (selectedFeatureIdRef.current !== null) {
          map.setFeatureState({ source: 'places', id: selectedFeatureIdRef.current }, { selected: false });
        }
        if (id !== null) {
          map.setFeatureState({ source: 'places', id }, { selected: true });
        }
        selectedFeatureIdRef.current = id;
      } catch {
        // Bỏ qua nếu source chưa kịp load hoặc map đang trong quá trình huỷ
      }
    },
    [mapRef]
  );

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];

      if (feature?.layer?.id === 'clusters') {
        const clusterId = feature.properties?.cluster_id;
        const source = mapRef?.getMap().getSource('places') as GeoJSONSource | undefined;
        const coordinates = (feature.geometry as unknown as { coordinates: [number, number] })
          .coordinates;
        if (source && clusterId !== undefined) {
          source
            .getClusterExpansionZoom(clusterId)
            .then((zoom) => {
              if (!mapRef) return;
              mapRef.easeTo({ center: coordinates, zoom, duration: 500 });
            })
            .catch(() => {
              // Bỏ qua nếu không lấy được zoom (vd cluster vừa biến mất do dữ liệu đổi)
            });
        }
        return;
      }

      if (feature?.layer?.id === 'unclustered-point') {
        const props = feature.properties as unknown as PlaceFeatureProps;
        const [lng, lat] = (feature.geometry as unknown as { coordinates: [number, number] })
          .coordinates;
        setSelectedWishlist(null);
        setSelected({ ...props, lng, lat });
        setSelectedFeature(props.id);
        return;
      }

      setSelected(null);
      setSelectedWishlist(null);
      setSelectedFeature(null);
      if (onMapClickEmpty) {
        onMapClickEmpty({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      }
    },
    [mapRef, onMapClickEmpty, setSelectedFeature]
  );

  function closeSelection() {
    setSelected(null);
    setSelectedFeature(null);
  }

  // Dọn feature-state khi component unmount, tránh rò rỉ state trên map instance
  useEffect(() => () => setSelectedFeature(null), [setSelectedFeature]);

  return (
    <div className={cn('relative h-full w-full', styleKey === 'dark' && 'map-dark-filter', className)}>
      <MapGL
        ref={setMapRef}
        initialViewState={DEFAULT_VIEW}
        mapStyle={MAP_STYLES[styleKey] as never}
        style={{ width: '100%', height: '100%' }}
        interactiveLayerIds={['clusters', 'unclustered-point']}
        onClick={handleClick}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" showCompass visualizePitch />
        <GeolocateControl position="bottom-right" trackUserLocation />
        <ScaleControl position="bottom-left" unit="metric" />
        <AttributionControl position="bottom-left" compact />

        <Source
          id="places"
          type="geojson"
          data={geojson as never}
          cluster
          clusterRadius={50}
          clusterMaxZoom={14}
        >
          <Layer
            id="clusters"
            type="circle"
            filter={['has', 'point_count'] as never}
            paint={
              {
                'circle-color': 'hsl(180, 55%, 30%)',
                'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 50, 30],
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
              } as never
            }
          />
          <Layer
            id="cluster-count"
            type="symbol"
            filter={['has', 'point_count'] as never}
            layout={{ 'text-field': '{point_count_abbreviated}', 'text-size': 12 } as never}
            paint={{ 'text-color': '#ffffff' } as never}
          />
          {/* Marker địa điểm — bán kính "nảy" to hơn khi được chọn (feature-state), có
              transition mượt thay vì đổi kích thước đột ngột */}
          <Layer
            id="unclustered-point"
            type="circle"
            filter={['!', ['has', 'point_count']] as never}
            paint={
              {
                'circle-color': ['get', 'ratingColor'],
                'circle-radius': [
                  'case',
                  ['boolean', ['feature-state', 'selected'], false],
                  13,
                  9,
                ],
                'circle-radius-transition': { duration: 250 },
                'circle-stroke-width': [
                  'case',
                  ['boolean', ['feature-state', 'selected'], false],
                  3,
                  2,
                ],
                'circle-stroke-color': '#ffffff',
                'circle-opacity':
                  nearMeActive && currentLocation
                    ? ['case', ['<=', ['get', 'distanceKm'], nearMeRadiusKm], 1, 0.2]
                    : 1,
                'circle-stroke-opacity':
                  nearMeActive && currentLocation
                    ? ['case', ['<=', ['get', 'distanceKm'], nearMeRadiusKm], 1, 0.2]
                    : 1,
              } as never
            }
          />
        </Source>

        {circleGeojson && (
          <Source id="near-me-radius" type="geojson" data={circleGeojson as never}>
            <Layer
              id="near-me-radius-fill"
              type="fill"
              paint={{ 'fill-color': 'hsl(180, 55%, 45%)', 'fill-opacity': 0.08 } as never}
            />
            <Layer
              id="near-me-radius-line"
              type="line"
              paint={{ 'line-color': 'hsl(180, 55%, 40%)', 'line-width': 2, 'line-dasharray': [2, 2] } as never}
            />
          </Source>
        )}

        {/* Wishlist: render dạng DOM Marker (không cluster, số lượng thường nhỏ) */}
        {wishlistWithCoords.map((item) => (
          <Marker
            key={item.id}
            longitude={item.lng as number}
            latitude={item.lat as number}
            anchor="bottom"
          >
            <WishlistMarkerPin
              priority={item.priority}
              isSelected={selectedWishlist?.id === item.id}
              onClick={() => {
                setSelected(null);
                setSelectedFeature(null);
                setSelectedWishlist(item);
              }}
            />
          </Marker>
        ))}

        {/* Popup nổi — chỉ dùng trên desktop, mobile dùng bottom sheet bên dưới */}
        {!isMobile && selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            onClose={closeSelection}
            closeButton={false}
            offset={16}
            anchor="bottom"
          >
            <PlaceInfoContent data={selected} onClose={closeSelection} />
          </Popup>
        )}

        {!isMobile && selectedWishlist && selectedWishlist.lat !== undefined && selectedWishlist.lng !== undefined && (
          <Popup
            longitude={selectedWishlist.lng}
            latitude={selectedWishlist.lat}
            onClose={() => setSelectedWishlist(null)}
            closeButton={false}
            offset={16}
            anchor="bottom"
          >
            <WishlistInfoContent
              item={selectedWishlist}
              categoryEmoji={categoryEmojiById[selectedWishlist.categoryId]}
              onClose={() => setSelectedWishlist(null)}
            />
          </Popup>
        )}
      </MapGL>

      {/* Bottom sheet Google Maps-style — chỉ hiện trên mobile */}
      {isMobile && (selected || selectedWishlist) && (
        <div className="map-bottom-sheet absolute inset-x-0 bottom-0 z-30 rounded-t-3xl border-t border-border bg-card p-4 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.12)]">
          {selected && <PlaceInfoContent data={selected} onClose={closeSelection} />}
          {selectedWishlist && (
            <WishlistInfoContent
              item={selectedWishlist}
              categoryEmoji={categoryEmojiById[selectedWishlist.categoryId]}
              onClose={() => setSelectedWishlist(null)}
            />
          )}
        </div>
      )}

      <div className="absolute right-3 top-3 flex flex-col items-end gap-2 sm:right-4 sm:top-4">
        <MapStyleSwitcher value={styleKey} onChange={setStyleKey} />
        <MapVisibilityFilter value={visibility} onChange={setVisibility} />
        <button
          type="button"
          onClick={() => setNearMeActive((v) => !v)}
          disabled={!currentLocation}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-medium shadow-md shadow-black/5 backdrop-blur transition-colors disabled:opacity-50',
            nearMeActive
              ? 'border-transparent bg-secondary text-secondary-foreground'
              : 'border-border bg-card/95 hover:bg-accent'
          )}
        >
          📍 Gần tôi
        </button>
        {nearMeActive && (
          <div className="flex gap-1 rounded-full border border-border bg-card/95 p-1 shadow-md shadow-black/5 backdrop-blur">
            {NEAR_ME_RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setNearMeRadiusKm(r)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
                  nearMeRadiusKm === r ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
                )}
              >
                {r < 1 ? `${r * 1000}m` : `${r}km`}
              </button>
            ))}
          </div>
        )}
      </div>

      {places && places.length === 0 && wishlist && wishlist.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center lg:bottom-8">
          <div className="pointer-events-auto rounded-full border border-border bg-card/95 px-4 py-2 text-xs text-muted-foreground shadow-md backdrop-blur">
            Bấm giữ chỗ bất kỳ trên bản đồ hoặc nút (+) để check-in nơi đầu tiên
          </div>
        </div>
      )}
    </div>
  );
}
