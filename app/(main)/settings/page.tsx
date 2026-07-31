'use client';

import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Check, Database, Download, MapPinned, Moon, Smile, Sun, Tags, Upload } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { db } from '@/lib/db/schema';
import { setAppTheme } from '@/components/shared/theme-provider';
import { updateSettings } from '@/lib/db/repositories/settings-repo';
import { downloadBackup, exportAllData, importAllData } from '@/lib/db/backup';
import { useToast } from '@/lib/hooks/use-toast';
import { useCategories } from '@/lib/hooks/use-categories';
import { usePlaces } from '@/lib/hooks/use-places';

const PASSING_BY_RADIUS_OPTIONS = [300, 500, 1000, 2000];
const MASCOT_FREQUENCY_OPTIONS: { value: 'low' | 'medium' | 'high'; label: string }[] = [
  { value: 'low', label: 'Ít' },
  { value: 'medium', label: 'Vừa' },
  { value: 'high', label: 'Nhiều' },
];

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Sáng', icon: Sun },
  { value: 'dark' as const, label: 'Tối', icon: Moon },
  { value: 'system' as const, label: 'Hệ thống', icon: Check },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);
  const categories = useCategories();
  const places = usePlaces();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [storageEstimate, setStorageEstimate] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    navigator.storage?.estimate?.().then((est) => {
      if (est.usage !== undefined) {
        const mb = est.usage / (1024 * 1024);
        setStorageEstimate(mb < 1 ? `${Math.round(est.usage / 1024)} KB` : `${mb.toFixed(1)} MB`);
      }
    });
  }, [places]);

  async function handleExport() {
    setIsExporting(true);
    try {
      const blob = await exportAllData();
      downloadBackup(blob);
      toast({ title: 'Đã xuất file backup', description: 'Lưu file này ở nơi an toàn (Google Drive, USB...).' });
    } catch (err) {
      toast({ title: 'Xuất dữ liệu thất bại', description: err instanceof Error ? err.message : undefined });
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImportFile(file: File) {
    setIsImporting(true);
    try {
      await importAllData(file);
      toast({ title: 'Đã khôi phục dữ liệu', description: 'Toàn bộ dữ liệu cũ đã được thay thế.' });
    } catch (err) {
      toast({
        title: 'Khôi phục thất bại',
        description: err instanceof Error ? err.message : 'File không hợp lệ.',
      });
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-5 pt-6 lg:p-8 animate-fade-in">
      <PageHeader title="Cài đặt" subtitle="Tuỳ chỉnh và quản lý dữ liệu của bạn" />

      {/* Giao diện */}
      <section className="space-y-2.5">
        <h2 className="text-sm font-semibold text-muted-foreground">Giao diện</h2>
        <div className="flex gap-2">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
            const active = (settings?.theme ?? 'system') === value;
            return (
              <button
                key={value}
                onClick={() => setAppTheme(value)}
                className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-medium transition-colors ${
                  active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-accent'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Danh mục */}
      <section className="space-y-2.5">
        <h2 className="text-sm font-semibold text-muted-foreground">Danh mục</h2>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="flex items-center gap-2 text-sm">
            <Tags className="h-4 w-4 text-muted-foreground" />
            {categories?.length ?? 0} danh mục địa điểm mặc định
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {categories?.map((c) => (
              <span key={c.id} className="rounded-full bg-accent px-2 py-1 text-xs">
                {c.emoji} {c.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Sao lưu */}
      <section className="space-y-2.5">
        <h2 className="text-sm font-semibold text-muted-foreground">Sao lưu & Khôi phục</h2>
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4 text-muted-foreground" />
            {places?.length ?? 0} địa điểm
            {storageEstimate && <span className="text-muted-foreground">· đang dùng ~{storageEstimate}</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleExport} disabled={isExporting}>
              <Download className="mr-1.5 h-4 w-4" />
              {isExporting ? 'Đang xuất...' : 'Export JSON'}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => importInputRef.current?.click()}
              disabled={isImporting}
            >
              <Upload className="mr-1.5 h-4 w-4" />
              {isImporting ? 'Đang nhập...' : 'Import JSON'}
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImportFile(file);
                e.target.value = '';
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            ⚠️ Import sẽ <strong>thay thế toàn bộ</strong> dữ liệu hiện tại bằng dữ liệu trong file. Nên
            Export trước khi Import để tránh mất dữ liệu.
          </p>
        </div>
      </section>

      {/* Đi ngang qua */}
      <section className="space-y-2.5">
        <h2 className="text-sm font-semibold text-muted-foreground">Đi ngang qua</h2>
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <MapPinned className="h-4 w-4 text-muted-foreground" />
              Nhắc khi ở gần địa điểm đã lưu
            </div>
            <Switch
              checked={settings?.passingByEnabled ?? false}
              onCheckedChange={(v) => updateSettings({ passingByEnabled: v })}
            />
          </div>

          {settings?.passingByEnabled && (
            <>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Bán kính gợi ý</p>
                <div className="flex gap-2">
                  {PASSING_BY_RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => updateSettings({ passingByRadiusM: r })}
                      className={`flex-1 rounded-xl border py-2 text-xs font-medium transition-colors ${
                        (settings?.passingByRadiusM ?? 500) === r
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background hover:bg-accent'
                      }`}
                    >
                      {r < 1000 ? `${r}m` : `${r / 1000}km`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Số lần hiển thị mỗi ngày</p>
                <div className="flex gap-2">
                  {[3, 5, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => updateSettings({ passingByDailyLimit: n })}
                      className={`flex-1 rounded-xl border py-2 text-xs font-medium transition-colors ${
                        (settings?.passingByDailyLimit ?? 5) === n
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background hover:bg-accent'
                      }`}
                    >
                      {n} lần
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const endOfDay = new Date();
                  endOfDay.setHours(23, 59, 59, 999);
                  updateSettings({ passingByHiddenUntil: endOfDay.getTime() });
                  toast({ title: 'Đã tạm ẩn đến hết hôm nay' });
                }}
              >
                Tạm ẩn gợi ý hôm nay
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Mascot */}
      <section className="space-y-2.5">
        <h2 className="text-sm font-semibold text-muted-foreground">Mascot đồng hành</h2>
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Smile className="h-4 w-4 text-muted-foreground" />
              Hiện mascot nhắc nhở
            </div>
            <Switch
              checked={settings?.mascotEnabled ?? true}
              onCheckedChange={(v) => updateSettings({ mascotEnabled: v })}
            />
          </div>
          {(settings?.mascotEnabled ?? true) && (
            <div className="flex gap-2">
              {MASCOT_FREQUENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateSettings({ mascotFrequency: opt.value })}
                  className={`flex-1 rounded-xl border py-2 text-xs font-medium transition-colors ${
                    (settings?.mascotFrequency ?? 'medium') === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background hover:bg-accent'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <p className="text-center font-mono text-xs text-muted-foreground">
        My Check-in Map — dữ liệu lưu offline hoàn toàn trên trình duyệt này.
      </p>
    </main>
  );
}
