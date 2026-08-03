import { MapPin } from 'lucide-react';
import type { MapSearchResult } from '@/lib/search/search-map';

interface MapSearchResultsProps {
  placeResults: MapSearchResult[];
  wishlistResults: MapSearchResult[];
  categoryEmojiById: Record<string, string>;
  onSelect: (result: MapSearchResult) => void;
  hasQuery: boolean;
}

export function MapSearchResultsDropdown({
  placeResults,
  wishlistResults,
  categoryEmojiById,
  onSelect,
  hasQuery,
}: MapSearchResultsProps) {
  const isEmpty = placeResults.length === 0 && wishlistResults.length === 0;

  if (!hasQuery) return null;

  return (
    <div className="animate-fade-in absolute inset-x-0 top-full z-10 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-border bg-card shadow-lg">
      {isEmpty ? (
        <p className="px-4 py-3 text-caption text-muted-foreground">Không tìm thấy địa điểm nào</p>
      ) : (
        <>
          {placeResults.length > 0 && (
            <ResultGroup
              title="📍 Đã ghé"
              results={placeResults}
              categoryEmojiById={categoryEmojiById}
              onSelect={onSelect}
            />
          )}
          {wishlistResults.length > 0 && (
            <ResultGroup
              title="⭐ Wishlist"
              results={wishlistResults}
              categoryEmojiById={categoryEmojiById}
              onSelect={onSelect}
            />
          )}
        </>
      )}
    </div>
  );
}

function ResultGroup({
  title,
  results,
  categoryEmojiById,
  onSelect,
}: {
  title: string;
  results: MapSearchResult[];
  categoryEmojiById: Record<string, string>;
  onSelect: (result: MapSearchResult) => void;
}) {
  return (
    <div className="py-1.5">
      <p className="px-4 py-1 text-label text-muted-foreground">{title}</p>
      {results.map((r) => (
        <button
          key={`${r.kind}:${r.id}`}
          type="button"
          onClick={() => onSelect(r)}
          className="flex w-full items-start gap-2.5 px-4 py-2 text-left hover:bg-accent"
        >
          <span className="mt-0.5 shrink-0">{categoryEmojiById[r.categoryId] ?? '📍'}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-body">{r.name}</span>
            {r.address && (
              <span className="flex items-center gap-1 truncate text-caption text-muted-foreground">
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                {r.address}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
