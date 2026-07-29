import withSerwistInit from '@serwist/next';

/**
 * Serwist thay thế cho next-pwa (đã ngừng bảo trì tốt).
 * swSrc: file service worker nguồn ta tự viết (app/sw.ts)
 * swDest: nơi build ra file service-worker.js public
 * Trong dev mode PWA sẽ tắt để tránh cache gây khó chịu khi code.
 */
const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Ảnh của app lưu trong IndexedDB (Blob), không dùng next/image remote loader
    unoptimized: true,
  },
};

export default withSerwist(nextConfig);
