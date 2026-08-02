'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';
import type { MapStyleKey } from '@/lib/map/map-styles';
import { MAP_STYLE_LABELS } from '@/lib/map/map-styles';
import type { MapVisibility } from '@/components/map/map-visibility-filter';
import { NEAR_ME_RADIUS_OPTIONS } from '@/lib/hooks/use-filtered-places';

export interface MapOptionsState {
  styleKey: MapStyleKey;
  visibility: MapVisibility;
  favoriteOnly: boolean;
  nearMeActive: boolean;
  nearMeRadiusKm: number;
}

interface MapOptionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: MapOptionsState;
  onChange: (value: MapOptionsState) => void;
  hasLocation: boolean;
}

const VISIBILITY_OPTIONS: { value: MapVisibility; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'visited', label: '📍 Đã đi' },
  { value: 'wishlist', label: '⭐ Wishlist' },
];

/**
 * Gộp 4 tuỳ chọn hiển thị bản đồ (trước đây là 3-4 widget rời rạc luôn nổi trên bản đồ)
 * vào 1 bottom sheet duy nhất, mở qua 1 icon — đúng nguyên tắc Progressive Disclosure
 * của Version 5: bản đồ chiếm tối đa diện tích, chỉ hiện tuỳ chọn khi người dùng cần.
 */
export function MapOptionsSheet({ open, onOpenChange, value, onChange, hasLocation }: MapOptionsSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tuỳ chọn bản đồ</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Hiển thị</Label>
            <div className="flex gap-2">
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ ...value, visibility: opt.value })}
                  className={cn(
                    'flex-1 rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors',
                    value.visibility === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card hover:bg-accent'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>❤️ Chỉ hiện Yêu thích</Label>
            <Switch
              checked={value.favoriteOnly}
              onCheckedChange={(v) => onChange({ ...value, favoriteOnly: v })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>📍 Gần tôi</Label>
              <Switch
                checked={value.nearMeActive}
                disabled={!hasLocation}
                onCheckedChange={(v) => onChange({ ...value, nearMeActive: v })}
              />
            </div>
            {value.nearMeActive && (
              <div className="flex flex-wrap gap-1.5">
                {NEAR_ME_RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => onChange({ ...value, nearMeRadiusKm: r })}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                      value.nearMeRadiusKm === r
                        ? 'border-secondary bg-secondary/10 text-secondary'
                        : 'border-border bg-card hover:bg-accent'
                    )}
                  >
                    {r < 1 ? `${r * 1000}m` : `${r}km`}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Kiểu bản đồ</Label>
            <div className="flex gap-2">
              {(Object.keys(MAP_STYLE_LABELS) as MapStyleKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => onChange({ ...value, styleKey: key })}
                  className={cn(
                    'flex-1 rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors',
                    value.styleKey === key
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card hover:bg-accent'
                  )}
                >
                  {MAP_STYLE_LABELS[key]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
