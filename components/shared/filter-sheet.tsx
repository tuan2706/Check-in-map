'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCategories } from '@/lib/hooks/use-categories';
import { DEFAULT_FILTERS, type PlaceFilters } from '@/lib/hooks/use-filtered-places';
import { cn } from '@/lib/utils/cn';
import type { CategoryId } from '@/types';

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: PlaceFilters;
  onChange: (filters: PlaceFilters) => void;
}

export function FilterSheet({ open, onOpenChange, filters, onChange }: FilterSheetProps) {
  const categories = useCategories();

  function toggleCategory(id: CategoryId) {
    const next = filters.categoryIds.includes(id)
      ? filters.categoryIds.filter((c) => c !== id)
      : [...filters.categoryIds, id];
    onChange({ ...filters, categoryIds: next });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bộ lọc</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Danh mục</Label>
            <div className="flex flex-wrap gap-2">
              {categories?.map((cat) => {
                const active = filters.categoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                      active ? 'border-transparent text-white' : 'border-border bg-card hover:bg-accent'
                    )}
                    style={active ? { backgroundColor: cat.color } : undefined}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rating tối thiểu</Label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onChange({ ...filters, minRating: r })}
                  className={cn(
                    'h-10 flex-1 rounded-xl border text-sm font-medium transition-colors',
                    filters.minRating === r
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card hover:bg-accent'
                  )}
                >
                  {r === 0 ? 'Tất cả' : `${r}★+`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-card px-4 py-3">
            <ToggleRow
              label="Chỉ hiện Yêu thích"
              checked={filters.favoriteOnly}
              onCheckedChange={(v) => onChange({ ...filters, favoriteOnly: v })}
            />
            <ToggleRow
              label="Chỉ hiện muốn quay lại"
              checked={filters.wouldReturnOnly}
              onCheckedChange={(v) => onChange({ ...filters, wouldReturnOnly: v })}
            />
            <ToggleRow
              label="Chỉ hiện có recommend"
              checked={filters.wouldRecommendOnly}
              onCheckedChange={(v) => onChange({ ...filters, wouldRecommendOnly: v })}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onChange(DEFAULT_FILTERS)}>
              Xoá bộ lọc
            </Button>
            <Button className="flex-1" onClick={() => onOpenChange(false)}>
              Áp dụng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
