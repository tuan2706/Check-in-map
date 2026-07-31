import type { StyleSpecification } from 'maplibre-gl';

/**
 * OpenFreeMap (https://openfreemap.org) — style vector miễn phí, không giới hạn lượt tải,
 * không cần đăng ký API key. Đây là lý do bạn không cần tài khoản Google Maps/MapTiler.
 *
 * Lưu ý: OpenFreeMap hiện chưa có style "dark" chính thức riêng, nên chế độ tối dùng
 * lại style "liberty" kèm CSS filter (xem .map-dark trong globals.css) — một kỹ thuật
 * phổ biến khi chưa có vector style tối riêng. Nếu sau này bạn muốn dark style "xịn"
 * hơn (không qua filter), có thể đổi sang MapTiler (cần free API key).
 */
const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [{ id: 'esri-satellite-layer', type: 'raster', source: 'esri-satellite' }],
};

export const MAP_STYLES = {
  // "liberty" giàu chi tiết hơn "positron": có tên đường, icon POI, gần với trải nghiệm
  // Google Maps hơn — đổi theo yêu cầu nâng cấp UX bản đồ ở Version 4.
  light: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/liberty',
  satellite: SATELLITE_STYLE,
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;

export const MAP_STYLE_LABELS: Record<MapStyleKey, string> = {
  light: 'Sáng',
  dark: 'Tối',
  satellite: 'Vệ tinh',
};
