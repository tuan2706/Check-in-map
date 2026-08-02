'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SearchToggleProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Mặc định chỉ là 1 icon tròn nhỏ — không chiếm chỗ trên bản đồ. Bấm vào mới trượt ra
 * thanh tìm kiếm đầy đủ + tự focus + hiện bàn phím, đúng nguyên tắc Progressive Disclosure
 * của Version 5 (giảm tối đa thành phần hiển thị mặc định).
 */
export function SearchToggle({ value, onChange, placeholder = 'Tìm địa điểm...', className }: SearchToggleProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleClose() {
    setOpen(false);
    onChange('');
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/95 shadow-md shadow-black/5 backdrop-blur transition-transform hover:scale-105 active:scale-95',
          className
        )}
        aria-label="Tìm kiếm"
      >
        <Search className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'animate-fade-in flex items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-2.5 shadow-md shadow-black/5 backdrop-blur',
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      <button
        type="button"
        onClick={handleClose}
        className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-accent"
        aria-label="Đóng tìm kiếm"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
