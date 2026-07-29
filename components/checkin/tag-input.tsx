'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder = '#ngon #quaylai...' }: TagInputProps) {
  const [draft, setDraft] = useState('');

  function commitDraft() {
    const cleaned = draft.trim().replace(/^#/, '');
    if (cleaned && !value.includes(cleaned)) {
      onChange([...value, cleaned]);
    }
    setDraft('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitDraft();
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2.5 focus-within:ring-2 focus-within:ring-ring"
      onClick={(e) => {
        // click vào vùng trống -> focus luôn vào input con
        if (e.target === e.currentTarget) {
          (e.currentTarget.querySelector('input') as HTMLInputElement | null)?.focus();
        }
      }}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary"
        >
          #{tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            aria-label={`Xoá tag ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder={value.length === 0 ? placeholder : ''}
        className="min-w-[100px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
