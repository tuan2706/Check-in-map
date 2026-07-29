'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initPersistentStorage } from '@/lib/db/schema';
import { seedDefaultData } from '@/lib/db/seed';
import { ThemeProvider } from '@/components/shared/theme-provider';

/**
 * Providers bọc toàn app:
 * - QueryClientProvider: cache cho các query đọc từ Dexie (kết hợp dexie-react-hooks ở các phase sau)
 * - useEffect seed dữ liệu mặc định + xin quyền lưu trữ bền vững, chỉ chạy 1 lần khi app mount
 *
 * new QueryClient() phải nằm trong useState để không bị tạo lại mỗi lần re-render.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    void initPersistentStorage();
    void seedDefaultData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}
