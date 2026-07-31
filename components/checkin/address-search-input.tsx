'use client';

import { useEffect, useState } from 'react';
import { Loader2, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { searchAddress, type GeocodeResult } from '@/lib/geocoding/nominatim';

interface AddressSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectResult: (result: GeocodeResult) => void;
  placeholder?: string;
}

/**
 * Gõ tên/địa chỉ -> sau 500ms ngừng gõ mới gọi Nominatim (debounce, tôn trọng giới hạn
 * ~1 request/giây của dịch vụ miễn phí). Nếu không có mạng, searchAddress() tự trả về
 * mảng rỗng — người dùng vẫn gõ địa chỉ tay hoặc bấm trên bản đồ như bình thường.
 */
export function AddressSearchInput({
  value,
  onChangeText,
  onSelectResult,
  placeholder = 'Số nhà, đường, quận... hoặc tên địa điểm',
}: AddressSearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedValue = useDebouncedValue(value, 500);

  useEffect(() => {
    let cancelled = false;
    if (debouncedValue.trim().length < 3) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    searchAddress(debouncedValue).then((found) => {
      if (!cancelled) {
        setResults(found);
        setIsSearching(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedValue]);

  const showDropdown = isFocused && (results.length > 0 || isSearching);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          placeholder={placeholder}
          className="pl-9"
        />
        {isSearching && (
          <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute inset-x-0 top-full z-10 mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
          {results.length === 0 && isSearching && (
            <p className="px-3.5 py-3 text-caption text-muted-foreground">Đang tìm...</p>
          )}
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onSelectResult(r);
                setResults([]);
              }}
              className="flex w-full items-start gap-2 px-3.5 py-2.5 text-left text-body hover:bg-accent"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="line-clamp-2">{r.displayName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
