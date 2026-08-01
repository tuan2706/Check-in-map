import { cn } from '@/lib/utils/cn';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  showTagline?: boolean;
}

/**
 * Logo "Our Places" — icon ghim bản đồ có 1 trái tim nhỏ lồng bên trong (thay vì chấm tròn
 * thông thường), gợi ý "địa điểm gắn với kỷ niệm/tình cảm" thay vì chỉ là toạ độ GPS.
 * Tối giản, phẳng (flat), không quá nhiều chi tiết theo đúng yêu cầu rebranding.
 */
export function Logo({ className, iconClassName, showTagline = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 32 32"
        className={cn('h-6 w-6 shrink-0', iconClassName)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 2C9.37 2 4 7.37 4 14c0 9 12 16 12 16s12-7 12-16c0-6.63-5.37-12-12-12Z"
          fill="hsl(var(--primary))"
        />
        <circle cx="13" cy="12.5" r="3" fill="white" />
        <circle cx="19" cy="12.5" r="3" fill="white" />
        <path d="M9.8 13 16 20l6.2-7c-1.3 1.6-3.4 1.6-4.4.2L16 12l-1.8 1.2c-1 1.4-3.1 1.4-4.4-.2Z" fill="white" />
      </svg>
      <div>
        <span className="text-h3">Our Places</span>
        {showTagline && <p className="text-caption text-muted-foreground">Every place has a story.</p>}
      </div>
    </div>
  );
}
