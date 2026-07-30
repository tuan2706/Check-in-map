'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCategories } from '@/lib/hooks/use-categories';
import {
  BUDGET_OPTIONS,
  DISTANCE_OPTIONS,
  SOURCE_OPTIONS,
} from '@/lib/random/default-filters';
import { cn } from '@/lib/utils/cn';
import { PRIORITY_LABELS } from '@/lib/validation/wishlist-schema';
import type { RandomFilters, WishlistPriority } from '@/types';

interface RandomFiltersPanelProps {
  filters: RandomFilters;
  onChange: (filters: RandomFilters) => void;
  poolSize: number;
}

export function RandomFiltersPanel({ filters, onChange, poolSize }: RandomFiltersPanelProps) {
  const categories = useCategories();

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Nguồn dữ liệu</Label>
        <div className="flex flex-wrap gap-2">
          {SOURCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...filters, source: opt.value })}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                filters.source === opt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card hover:bg-accent'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Danh mục</Label>
        <div className="flex flex-wrap gap-1.5">
          {categories?.map((cat) => {
            const active = filters.categoryIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                title={cat.label}
                onClick={() =>
                  onChange({
                    ...filters,
                    categoryIds: active
                      ? filters.categoryIds.filter((c) => c !== cat.id)
                      : [...filters.categoryIds, cat.id],
                  })
                }
                className={cn(
                  'rounded-full border px-2.5 py-1 text-sm transition-colors',
                  active ? 'border-transparent text-white' : 'border-border bg-card hover:bg-accent'
                )}
                style={active ? { backgroundColor: cat.color } : undefined}
              >
                {cat.emoji}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Khoảng cách</Label>
        <div className="flex flex-wrap gap-2">
          {DISTANCE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange({ ...filters, maxDistanceKm: opt.value })}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                filters.maxDistanceKm === opt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card hover:bg-accent'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Ngân sách</Label>
        <div className="flex flex-wrap gap-2">
          {BUDGET_OPTIONS.map((opt) => {
            const active = filters.minBudget === opt.value[0] && filters.maxBudget === opt.value[1];
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onChange({ ...filters, minBudget: opt.value[0], maxBudget: opt.value[1] })}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-accent'
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {(filters.source === 'wishlist' || filters.source === 'not_visited' || filters.source === 'all') && (
        <div className="space-y-2">
          <Label>Mức độ ưu tiên (Wishlist)</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...filters, priority: null })}
              className={cn(
                'flex-1 rounded-xl border px-2 py-2 text-xs font-medium transition-colors',
                filters.priority === null ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card'
              )}
            >
              Tất cả
            </button>
            {(Object.keys(PRIORITY_LABELS) as WishlistPriority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChange({ ...filters, priority: p })}
                className={cn(
                  'flex-1 rounded-xl border px-2 py-2 text-xs font-medium transition-colors',
                  filters.priority === p ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card'
                )}
              >
                {PRIORITY_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      )}

      {(filters.source === 'visited' || filters.source === 'all') && (
        <div className="space-y-2">
          <Label>Đánh giá tối thiểu (nơi đã ghé)</Label>
          <div className="flex gap-2">
            {[null, 3, 4].map((r) => (
              <button
                key={r ?? 'all'}
                type="button"
                onClick={() => onChange({ ...filters, minRating: r })}
                className={cn(
                  'flex-1 rounded-xl border px-2 py-2 text-xs font-medium transition-colors',
                  filters.minRating === r ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card'
                )}
              >
                {r ? `${r}★+` : 'Tất cả'}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1">
            <Label className="text-body font-normal">Chỉ nơi muốn quay lại</Label>
            <Switch
              checked={filters.wouldReturnOnly}
              onCheckedChange={(v) => onChange({ ...filters, wouldReturnOnly: v })}
            />
          </div>
        </div>
      )}

      <p className="text-center text-caption text-muted-foreground">
        {poolSize > 0 ? `${poolSize} địa điểm phù hợp với bộ lọc` : 'Không có địa điểm nào khớp bộ lọc này'}
      </p>
    </div>
  );
}
