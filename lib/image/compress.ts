import imageCompression from 'browser-image-compression';

/**
 * Nén ảnh gốc: giới hạn cạnh dài 1920px, dung lượng mục tiêu ~1MB, chất lượng ~80%.
 * Vẫn đủ nét để xem lại trên điện thoại/màn hình lớn, nhưng nhẹ hơn nhiều so với ảnh
 * gốc từ camera (thường 3-8MB/ảnh) — quan trọng vì brief yêu cầu lưu được "hàng chục
 * nghìn ảnh" mà không hết dung lượng trình duyệt.
 */
export async function compressImage(file: File): Promise<Blob> {
  return imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    initialQuality: 0.8,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });
}

/**
 * Thumbnail riêng, nhỏ hơn nhiều (cạnh dài 400px) — dùng cho card/list/grid để load nhanh,
 * không phải giải nén ảnh full-size chỉ để hiển thị 1 ô vuông bé.
 */
export async function generateThumbnail(file: File): Promise<Blob> {
  return imageCompression(file, {
    maxSizeMB: 0.15,
    maxWidthOrHeight: 400,
    initialQuality: 0.7,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });
}
