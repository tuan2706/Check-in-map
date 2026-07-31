/** Tạo polygon xấp xỉ hình tròn quanh center, bán kính tính bằng km — dùng để vẽ trực quan
 *  vòng tròn "Gần tôi" trên bản đồ (không cần thư viện turf.js). */
export function createCircleGeoJSON(
  center: { lat: number; lng: number },
  radiusKm: number,
  points = 64
) {
  const coords: [number, number][] = [];
  const earthRadiusKm = 6371;

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = radiusKm * Math.cos(angle);
    const dy = radiusKm * Math.sin(angle);

    const deltaLat = dy / earthRadiusKm;
    const deltaLng = dx / (earthRadiusKm * Math.cos((center.lat * Math.PI) / 180));

    coords.push([center.lng + (deltaLng * 180) / Math.PI, center.lat + (deltaLat * 180) / Math.PI]);
  }

  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coords],
    },
  };
}
