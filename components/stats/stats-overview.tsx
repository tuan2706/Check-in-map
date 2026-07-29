'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PlaceStats } from '@/lib/hooks/use-stats';

interface StatsOverviewProps {
  stats: PlaceStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  if (stats.totalPlaces === 0) return null;

  const chartData = stats.categoryStats.slice(0, 8).map((c) => ({
    name: `${c.emoji} ${c.label}`,
    count: c.count,
    color: c.color,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatCard value={stats.totalPlaces} label="Đã check-in" />
        <StatCard value={stats.totalImages} label="Tổng số ảnh" />
        <StatCard value={`${stats.averageRating}★`} label="Rating TB" />
        <StatCard value={`${(stats.totalCost / 1000).toLocaleString('vi-VN')}k`} label="Tổng chi phí" />
      </div>

      {chartData.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-3 text-label text-muted-foreground">Theo danh mục</p>
          <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 32)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))' }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid hsl(var(--border))',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {stats.topDishes.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-2 text-label text-muted-foreground">Món hay được nhắc tới</p>
          <div className="flex flex-wrap gap-1.5">
            {stats.topDishes.map((d) => (
              <span key={d.dish} className="rounded-full bg-accent px-2.5 py-1 text-xs">
                {d.dish} <span className="text-muted-foreground">×{d.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 text-center">
      <p className="text-h2">{value}</p>
      <p className="mt-0.5 text-caption text-muted-foreground">{label}</p>
    </div>
  );
}
