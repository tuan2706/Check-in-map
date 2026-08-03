/**
 * Chuẩn hoá chuỗi tiếng Việt để so sánh khi tìm kiếm: bỏ dấu + viết thường + trim.
 * Dùng Unicode NFD để tách dấu ra khỏi ký tự gốc rồi loại bỏ, xử lý riêng chữ "đ/Đ"
 * vì Unicode không tách "đ" thành "d" + dấu (nó là 1 ký tự riêng biệt trong bảng mã).
 *
 * Ví dụ: "Nguyễn Huệ" -> "nguyen hue", "Phở" -> "pho"
 */
export function normalizeSearchText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/** true nếu `text` có chứa `query` sau khi đã chuẩn hoá cả 2 (không dấu, không phân biệt hoa/thường) */
export function fuzzyMatch(text: string | undefined | null, normalizedQuery: string): boolean {
  if (!text || !normalizedQuery) return false;
  return normalizeSearchText(text).includes(normalizedQuery);
}
