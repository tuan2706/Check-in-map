'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
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
import type { GeoJSONSource, LngLatBounds } from 'maplibre-gl';
import { cn } from '@/lib/utils/cn';
import { db } from '@/lib/db/schema';
import { SlidersHorizontal } from 'lucide-react';
import { MAP_STYLES, type MapStyleKey } from '@/lib/map/map-styles';
import { MapOptionsSheet } from '@/components/map/map-options-sheet';
import type { MapVisibility } from '@/components/map/map-visibility-filter';
import { WishlistMarkerPin } from '@/components/map/wishlist-marker-pin';
import { MemoryCardMarker } from '@/components/map/memory-card-marker';
import { PlaceInfoContent } from '@/components/map/place-info-content';
import { WishlistInfoContent } from '@/components/map/wishlist-info-content';
import { placesToGeoJSON, type PlaceFeatureProps } from '@/lib/map/places-to-geojson';
import { getRatingColor } from '@/lib/map/rating-color';
import { usePlaces } from '@/lib/hooks/use-places';
import { useWishlist } from '@/lib/hooks/use-wishlist';
import { useCategories } from '@/lib/hooks/use-categories';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import { useCurrentLocation } from '@/lib/hooks/use-current-location';
import { createCircleGeoJSON } from '@/lib/map/circle-geojson';
import { haversineDistanceKm } from '@/lib/utils/geo';
import { DEFAULT_NEAR_ME_RADIUS_KM } from '@/lib/hooks/use-filtered-places';
import type { PlaceWithRelations, WishlistPlaceWithMeta } from '@/types';

const DEFAULT_VIEW = { longitude: 106.700424, latitude: 10.776889, zoom: 11 }; // TP.HCM mặc định
// Từ mức zoom này trở lên, GL source vốn đã ngừng cluster (clusterMaxZoom) và render từng
// điểm riêng lẻ -> đúng thời điểm để thay bằng Memory Card Marker thay vì chấm tròn.
const CARD_MARKER_MIN_ZOOM = 14;
// Giới hạn số lượng card render cùng lúc để bảo vệ hiệu năng dù đang trong vùng hiển thị nhỏ
const MAX_VISIBLE_CARDS = 80;

interface PlaceMapProps {
  onMapClickEmpty?: (lngLat: { lat: number; lng: number }) => void;
  className?: string;
}

function sizeForZoom(zoom: number, style: 'photo' | 'memory_card'): 'small' | 'medium' | 'full' {
  if (zoom < 16) return 'small';
  if (style === 'photo') return 'medium';
  return zoom >= 17 ? 'full' : 'medium';
}

export function PlaceMap({ onMapClickEmpty, className }: PlaceMapProps) {
  const places = usePlaces();
  const wishlist = useWishlist();
  const categories = useCategories();
  const isMobile = useIsMobile();
  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);
  const [mapOptions, setMapOptions] = useState({
    styleKey: 'light' as MapStyleKey,
    visibility: 'all' as MapVisibility,
    favoriteOnly: false,
    nearMeActive: false,
    nearMeRadiusKm: DEFAULT_NEAR_ME_RADIUS_KM,
  });
  const [optionsSheetOpen, setOptionsSheetOpen] = useState(false);
  const { styleKey, visibility, favoriteOnly, nearMeActive, nearMeRadiusKm } = mapOptions;
  const [selected, setSelected] = useState<(PlaceFeatureProps & { lng: number; lat: number }) | null>(
    null
  );
  const [selectedWishlist, setSelectedWishlist] = useState<WishlistPlaceWithMeta | null>(null);
  const [mapRef, setMapRef] = useState<MapRef | null>(null);
  const selectedFeatureIdRef = useRef<number | null>(null);
  const currentLocation = useCurrentLocation();
  const [viewInfo, setViewInfo] = useState<{ zoom: number; bounds: LngLatBounds | null }>({
    zoom: DEFAULT_VIEW.zoom,
    bounds: null,
  });

  const categoryEmojiById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categories ?? []) map[c.id] = c.emoji;
    return map;
  }, [categories]);

  const categoryById = useMemo(() => {
    const map = new Map(categories?.map((c) => [c.id, c]));
    return map;
  }, [categories]);

  const showVisited = visibility === 'all' || visibility === 'visited';
  const showWishlist = visibility === 'all' || visibility === 'wishlist';

  const visiblePlaces = useMemo(() => {
    if (!showVisited) return [];
    const source = places ?? [];
    return favoriteOnly ? source.filter((p) => p.isFavorite) : source;
  }, [places, showVisited, favoriteOnly]);

  const markerStyle = settings?.markerStyle ?? 'memory_card';
  const useCardMarkers = showVisited && markerStyle !== 'classic' && viewInfo.zoom >= CARD_MARKER_MIN_ZOOM;
  const cardSize = sizeForZoom(viewInfo.zoom, markerStyle === 'photo' ? 'photo' : 'memory_card');

  const geojson = useMemo(
    () => placesToGeoJSON(visiblePlaces, categoryEmojiById, currentLocation),
    [visiblePlaces, categoryEmojiById, currentLocation]
  );

  const circleGeojson = useMemo(() => {
    if (!nearMeActive || !currentLocation) return null;
    return createCircleGeoJSON(currentLocation, nearMeRadiusKm);
  }, [nearMeActive, currentLocation, nearMeRadiusKm]);

  const wishlistWithCoords = useMemo(
    () => (showWishlist ? (wishlist ?? []).filter((w) => w.lat !== undefined && w.lng !== undefined) : []),
    [wishlist, showWishlist]
  );

  /** Chỉ những địa điểm nằm trong vùng bản đồ đang hiển thị mới render Memory Card —
   *  đúng yêu cầu "chỉ tải marker trong vùng đang hiển thị" để tối ưu hiệu năng. */
  const visibleCardPlaces = useMemo(() => {
    if (!useCardMarkers || !viewInfo.bounds) return [];
    const bounds = viewInfo.bounds;
    const filtered = visiblePlaces.filter((p) => bounds.contains([p.lng, p.lat]));
    return filtered.slice(0, MAX_VISIBLE_CARDS);
  }, [useCardMarkers, viewInfo.bounds, visiblePlaces]);

  const handleMoveEnd = useCallback(() => {
    const map = mapRef?.getMap();
    if (!map) return;
    setViewInfo({ zoom: map.getZoom(), bounds: map.getBounds() });
  }, [mapRef]);

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

  const selectPlace = useCallback(
    (place: PlaceWithRelations) => {
      setSelectedWishlist(null);
      setSelected({
        id: place.id as number,
        name: place.name,
        categoryEmoji: categoryEmojiById[place.categoryId] ?? '📍',
        rating: place.rating,
        ratingColor: getRatingColor(place.rating),
        checkinDate: place.checkinDate,
        distanceKm: currentLocation
          ? haversineDistanceKm(currentLocation, { lat: place.lat, lng: place.lng })
          : null,
        lng: place.lng,
        lat: place.lat,
      });
      setSelectedFeature(place.id as number);
    },
    [categoryEmojiById, currentLocation, setSelectedFeature]
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
        interactiveLayerIds={useCardMarkers ? ['clusters'] : ['clusters', 'unclustered-point']}
        onClick={handleClick}
        onLoad={handleMoveEnd}
        onMoveEnd={handleMoveEnd}
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
          clusterMaxZoom={CARD_MARKER_MIN_ZOOM}
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
          {/* Chấm tròn cổ điển — TỰ ẨN khi Memory Card Marker đang đảm nhiệm hiển thị ở
              cùng mức zoom, tránh vẽ chồng 2 kiểu marker lên nhau */}
          <Layer
            id="unclustered-point"
            type="circle"
            filter={['!', ['has', 'point_count']] as never}
            paint={
              {
                'circle-color': ['get', 'ratingColor'],
                'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 13, 9],
                'circle-radius-transition': { duration: 250 },
                'circle-stroke-width': ['case', ['boolean', ['feature-state', 'selected'], false], 3, 2],
                'circle-stroke-color': '#ffffff',
                'circle-opacity': useCardMarkers
                  ? 0
                  : nearMeActive && currentLocation
                    ? ['case', ['<=', ['get', 'distanceKm'], nearMeRadiusKm], 1, 0.2]
                    : 1,
                'circle-stroke-opacity': useCardMarkers
                  ? 0
                  : nearMeActive && currentLocation
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

        {/* Signature Feature — Memory Card Marker: chỉ render trong vùng đang hiển thị */}
        {useCardMarkers &&
          visibleCardPlaces.map((place) => (
            <Marker key={place.id} longitude={place.lng} latitude={place.lat} anchor="bottom">
              <MemoryCardMarker
                place={place}
                category={categoryById.get(place.categoryId)}
                size={cardSize}
                isSelected={selected?.id === place.id}
                onClick={() => selectPlace(place)}
              />
            </Marker>
          ))}

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

      <button
        type="button"
        onClick={() => setOptionsSheetOpen(true)}
        className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/95 shadow-md shadow-black/5 backdrop-blur transition-transform hover:scale-105 active:scale-95 sm:right-4 sm:top-4"
        aria-label="Tuỳ chọn bản đồ"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {(favoriteOnly || nearMeActive || visibility !== 'all') && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        )}
      </button>

      <MapOptionsSheet
        open={optionsSheetOpen}
        onOpenChange={setOptionsSheetOpen}
        value={mapOptions}
        onChange={setMapOptions}
        hasLocation={!!currentLocation}
      />

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
