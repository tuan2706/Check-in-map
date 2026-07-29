function ShimmerBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-shimmer rounded bg-[linear-gradient(90deg,hsl(var(--muted))_25%,hsl(var(--accent))_37%,hsl(var(--muted))_63%)] bg-[length:400%_100%] ${className}`}
    />
  );
}

export function PlaceListSkeleton() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-3">
          <ShimmerBlock className="h-16 w-16 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <ShimmerBlock className="h-4 w-2/3" />
            <ShimmerBlock className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
