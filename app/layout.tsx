import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Providers } from '@/components/shared/providers';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

// Geist Sans/Mono (Vercel) — thay cho Fraunces/Inter/IBM Plex Mono ở Version 1.
// Package "geist" đã tự tối ưu font qua next/font nội bộ, chỉ cần import trực tiếp.

export const metadata: Metadata = {
  title: 'Our Places — Every place has a story.',
  description: 'Our memories. Our journeys. Our Places. — sổ tay ghi lại mọi hành trình và kỷ niệm của riêng bạn.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Our Places',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
