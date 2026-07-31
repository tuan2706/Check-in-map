export interface GeocodeResult {
  displayName: string;
  lat: number;
  lng: number;
}

interface NominatimRawResult {
  display_name: string;
  lat: string;
  lon: string;
}

/**
 * Nominatim (OpenStreetMap) — dịch vụ geocoding miễn phí, không cần đăng ký/API key.
 * Đây là bước DUY NHẤT trong toàn bộ app cần kết nối Internet — nếu không có mạng,
 * hàm sẽ trả về mảng rỗng, người dùng vẫn có thể nhập GPS thủ công/bấm trên bản đồ như cũ.
 *
 * Lưu ý: Nominatim giới hạn ~1 request/giây cho dùng miễn phí — luôn debounce ở phía UI
 * trước khi gọi hàm này (xem address-search-input.tsx), không gọi trực tiếp theo từng
 * phím gõ.
 */
export async function searchAddress(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=0&q=${encodeURIComponent(
      trimmed
    )}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];

    const data = (await res.json()) as NominatimRawResult[];
    return data.map((r) => ({
      displayName: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    }));
  } catch {
    // Mất mạng hoặc Nominatim tạm lỗi -> im lặng trả về rỗng, không làm vỡ form
    return [];
  }
}
