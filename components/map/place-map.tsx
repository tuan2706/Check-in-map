'use client';

import { useCallback, useMemo, useState } from 'react';
import MapGL, {
  GeolocateControl,
  Layer,
  Marker,
  NavigationControl,
  Popup,
  Source,
  type MapLayerMouseEvent,
  type MapRef,
} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { GeoJSONSource } from 'maplibre-gl';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { MAP_STYLES, type MapStyleKey } from '@/lib/map/map-styles';
import { MapStyleSwitcher } from '@/components/map/map-style-switcher';
import { MapVisibilityFilter, type MapVisibility } from '@/components/map/map-visibility-filter';
import { WishlistMarkerPin } from '@/components/map/wishlist-marker-pin';
import { placesToGeoJSON, type PlaceFeatureProps } from '@/lib/map/places-to-geojson';
import { usePlaces } from '@/lib/hooks/use-places';
import { useWishlist } from '@/lib/hooks/use-wishlist';
import { useCategories } from '@/lib/hooks/use-categories';
import { RatingStamp } from '@/components/place/rating-stamp';
import { PriorityBadge } from '@/components/wishlist/priority-badge';
import type { Rating, WishlistPlaceWithMeta } from '@/types';

const DEFAULT_VIEW = { longitude: 106.700424, latitude: 10.776889, zoom: 11 }; // TP.HCM mặc định

interface PlaceMapProps {
  onMapClickEmpty?: (lngLat: { lat: number; lng: number }) => void;
  className?: string;
}

export function PlaceMap({ onMapClickEmpty, className }: PlaceMapProps) {
  const places = usePlaces();
  const wishlist = useWishlist();
  const categories = useCategories();
  const [styleKey, setStyleKey] = useState<MapStyleKey>('light');
  const [visibility, setVisibility] = useState<MapVisibility>('all');
  const [selected, setSelected] = useState<(PlaceFeatureProps & { lng: number; lat: number }) | null>(
    null
  );
  const [selectedWishlist, setSelectedWishlist] = useState<WishlistPlaceWithMeta | null>(null);
  const [mapRef, setMapRef] = useState<MapRef | null>(null);

  const categoryEmojiById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categories ?? []) map[c.id] = c.emoji;
    return map;
  }, [categories]);

  const showVisited = visibility === 'all' || visibility === 'visited';
  const showWishlist = visibility === 'all' || visibility === 'wishlist';

  const geojson = useMemo(
    () => placesToGeoJSON(showVisited ? places ?? [] : [], categoryEmojiById),
    [places, categoryEmojiById, showVisited]
  );

  const wishlistWithCoords = useMemo(
    () => (showWishlist ? (wishlist ?? []).filter((w) => w.lat !== undefined && w.lng !== undefined) : []),
    [wishlist, showWishlist]
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
              mapRef.easeTo({ center: coordinates, zoom, duration: 400 });
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
        return;
      }

      setSelected(null);
      setSelectedWishlist(null);
      if (onMapClickEmpty) {
        onMapClickEmpty({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      }
    },
    [mapRef, onMapClickEmpty]
  );

  return (
    <div className={cn('relative h-full w-full', styleKey === 'dark' && 'map-dark-filter', className)}>
      <MapGL
        ref={setMapRef}
        initialViewState={DEFAULT_VIEW}
        mapStyle={MAP_STYLES[styleKey] as never}
        style={{ width: '100%', height: '100%' }}
        interactiveLayerIds={['clusters', 'unclustered-point']}
        onClick={handleClick}
        attributionControl={{ compact: true }}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <GeolocateControl position="bottom-right" trackUserLocation />

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
          <Layer
            id="unclustered-point"
            type="circle"
            filter={['!', ['has', 'point_count']] as never}
            paint={
              {
                'circle-color': ['get', 'ratingColor'],
                'circle-radius': 9,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
              } as never
            }
          />
        </Source>

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
              onClick={() => {
                setSelected(null);
                setSelectedWishlist(item);
              }}
            />
          </Marker>
        ))}

        {/* Hiệu ứng ping tại vị trí marker đang được chọn */}
        {selected && (
          <Marker longitude={selected.lng} latitude={selected.lat} anchor="center">
            <div
              className="marker-ping h-4 w-4 rounded-full"
              style={{ backgroundColor: selected.ratingColor }}
            />
          </Marker>
        )}

        {selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            onClose={() => setSelected(null)}
            closeButton={false}
            offset={14}
            anchor="bottom"
          >
            <div className="flex items-center gap-3 p-1">
              <RatingStamp rating={selected.rating as Rating} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-h4">
                  {selected.categoryEmoji} {selected.name}
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">{selected.checkinDate}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="ml-1 shrink-0 text-muted-foreground"
                aria-label="Đóng"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </Popup>
        )}

        {selectedWishlist && selectedWishlist.lat !== undefined && selectedWishlist.lng !== undefined && (
          <Popup
            longitude={selectedWishlist.lng}
            latitude={selectedWishlist.lat}
            onClose={() => setSelectedWishlist(null)}
            closeButton={false}
            offset={14}
            anchor="bottom"
          >
            <div className="flex items-center gap-2.5 p-1">
              <div className="min-w-0">
                <p className="truncate text-h4">
                  {categoryEmojiById[selectedWishlist.categoryId]} {selectedWishlist.name}
                </p>
                <div className="mt-1">
                  <PriorityBadge priority={selectedWishlist.priority} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWishlist(null)}
                className="ml-1 shrink-0 text-muted-foreground"
                aria-label="Đóng"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </Popup>
        )}
      </MapGL>

      <div className="absolute right-3 top-3 flex flex-col items-end gap-2 sm:right-4 sm:top-4">
        <MapStyleSwitcher value={styleKey} onChange={setStyleKey} />
        <MapVisibilityFilter value={visibility} onChange={setVisibility} />
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
