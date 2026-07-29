'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:brightness-105',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:brightness-110',
        outline: 'border border-border bg-card hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-secondary underline-offset-4 hover:underline',
        destructive: 'bg-destructive text-destructive-foreground hover:brightness-105',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 px-4 text-[13px]',
        lg: 'h-14 px-7 text-base',
        icon: 'h-11 w-11 shrink-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

let rippleId = 0;

/**
 * Ripple effect (V2.7 micro-interaction): mô phỏng hiệu ứng gợn sóng khi bấm,
 * lấy cảm hứng từ Material Design nhưng tinh chỉnh nhẹ nhàng hơn (opacity thấp,
 * biến mất nhanh trong ~500ms) để phù hợp phong cách tối giản của app.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onPointerDown, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const [ripples, setRipples] = React.useState<Ripple[]>([]);

    function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.6;
      const id = rippleId++;
      setRipples((prev) => [
        ...prev,
        { id, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size },
      ]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 500);
      onPointerDown?.(e);
    }

    if (asChild) {
      // Slot cần đúng 1 child — bỏ qua ripple để tránh vỡ cấu trúc DOM khi asChild
      return (
        <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Comp>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onPointerDown={handlePointerDown}
        {...props}
      >
        {children}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="pointer-events-none absolute rounded-full bg-white/40 animate-ripple"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
          />
        ))}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
