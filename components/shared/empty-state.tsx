import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Empty state dùng chung — theo nguyên tắc "màn hình trống là lời mời hành động",
 * không chỉ báo "không có gì" mà luôn gợi ý bước tiếp theo cụ thể.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 px-8 py-16 text-center', className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-7 w-7" strokeWidth={1.6} />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-display text-lg font-medium">{title}</h3>
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
