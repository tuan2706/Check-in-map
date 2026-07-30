import { useSpinHistory } from '@/lib/hooks/use-spin-history';

export function SpinHistoryStrip() {
  const history = useSpinHistory();

  if (!history || history.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-label text-muted-foreground">Tuần này đã quay trúng</p>
      <div className="flex flex-wrap gap-1.5">
        {history.slice(0, 6).map((item) => (
          <span key={item.id} className="rounded-full bg-accent px-2.5 py-1 text-caption">
            {item.emoji} {item.name}
          </span>
        ))}
      </div>
    </div>
  );
}
