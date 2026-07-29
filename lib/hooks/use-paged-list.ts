import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Không dùng thư viện virtual-list chuyên dụng (react-window/react-virtual) để tránh
 * thêm dependency mới. Thay vào đó: chỉ render N phần tử đầu, dùng IntersectionObserver
 * để tự tải thêm khi người dùng cuộn gần tới cuối danh sách — đủ tốt cho danh sách vài
 * nghìn địa điểm vì phần lớn không bao giờ render cùng lúc.
 */
export function usePagedList<T>(items: T[] | undefined, pageSize = 30) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [items, pageSize]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => c + pageSize);
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pageSize]);

  const visibleItems = useMemo(() => items?.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = (items?.length ?? 0) > visibleCount;

  return { visibleItems, sentinelRef, hasMore };
}
