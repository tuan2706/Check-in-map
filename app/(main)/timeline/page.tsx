'use client';

import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronDown, History } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { PlaceCard } from '@/components/place/place-card';
import { PlaceListSkeleton } from '@/components/place/place-list-skeleton';
import { StatsOverview } from '@/components/stats/stats-overview';
import { usePlaces } from '@/lib/hooks/use-places';
import { useCategories } from '@/lib/hooks/use-categories';
import { useStats } from '@/lib/hooks/use-stats';
import { cn } from '@/lib/utils/cn';
import type { PlaceWithRelations } from '@/types';

interface YearGroup {
  year: string;
  months: { monthKey: string; monthLabel: string; places: PlaceWithRelations[] }[];
}

function groupByYearMonth(places: PlaceWithRelations[]): YearGroup[] {
  const byYear = new Map<string, Map<string, PlaceWithRelations[]>>();

  for (const place of places) {
    const date = parseISO(place.checkinDate);
    const year = format(date, 'yyyy');
    const monthKey = format(date, 'yyyy-MM');

    if (!byYear.has(year)) byYear.set(year, new Map());
    const months = byYear.get(year)!;
    if (!months.has(monthKey)) months.set(monthKey, []);
    months.get(monthKey)!.push(place);
  }

  return [...byYear.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, months]) => ({
      year,
      months: [...months.entries()]
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([monthKey, monthPlaces]) => ({
          monthKey,
          monthLabel: format(parseISO(`${monthKey}-01`), 'MMMM yyyy', { locale: vi }),
          places: monthPlaces,
        })),
    }));
}

export default function TimelinePage() {
  const places = usePlaces();
  const categories = useCategories();
  const stats = useStats(places, categories);
  const categoryById = useMemo(() => new Map(categories?.map((c) => [c.id, c])), [categories]);
  const [collapsedYears, setCollapsedYears] = useState<Set<string>>(new Set());

  const groups = useMemo(() => groupByYearMonth(places ?? []), [places]);

  function toggleYear(year: string) {
    setCollapsedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-5 pt-6 lg:p-8 animate-fade-in">
      <PageHeader title="Dòng thời gian" subtitle="Nhìn lại hành trình theo ngày, tháng, năm" />

      {places === undefined ? (
        <PlaceListSkeleton />
      ) : places.length === 0 ? (
        <EmptyState
          icon={History}
          title="Dòng thời gian còn trống"
          description="Mỗi lần check-in sẽ tự động xuất hiện ở đây, sắp xếp theo thời gian."
        />
      ) : (
        <>
          <StatsOverview stats={stats} />

          <div className="space-y-5">
            {groups.map((group) => {
              const isCollapsed = collapsedYears.has(group.year);
              const yearCount = group.months.reduce((sum, m) => sum + m.places.length, 0);
              return (
                <div key={group.year} className="space-y-4">
                  <button
                    onClick={() => toggleYear(group.year)}
                    className="flex w-full items-center justify-between"
                  >
                    <h2 className="text-h2">
                      {group.year}{' '}
                      <span className="text-body font-normal text-muted-foreground">
                        · {yearCount} check-in
                      </span>
                    </h2>
                    <ChevronDown
                      className={cn('h-5 w-5 text-muted-foreground transition-transform', isCollapsed && '-rotate-90')}
                    />
                  </button>

                  {!isCollapsed &&
                    group.months.map((month) => (
                      <div key={month.monthKey} className="space-y-2.5 border-l-2 border-border pl-4">
                        <p className="text-label capitalize text-muted-foreground">
                          {month.monthLabel} · {month.places.length} nơi
                        </p>
                        {month.places.map((place) => (
                          <PlaceCard
                            key={place.id}
                            place={place}
                            category={categoryById.get(place.categoryId)}
                          />
                        ))}
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
