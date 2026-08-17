import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-bold font-heading transition-all duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brand-fill)] text-[var(--color-on-brand)] hover:opacity-95 shadow-elev-1",
        sky:
          "bg-[var(--brand-fill)] text-[var(--color-on-brand)] hover:opacity-95 shadow-elev-1",
        emerald:
          "bg-[var(--color-success)] text-[var(--color-on-brand)] hover:opacity-95 shadow-elev-1",
        crown:
          "bg-[var(--color-crown)] text-[var(--text-primary)] hover:opacity-95 shadow-elev-1",
        glow:
          "bg-[var(--brand-fill)] text-[var(--color-on-brand)] shadow-glow-sky hover:opacity-95",
        outline:
          "border border-[var(--surface-border-strong)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] shadow-elev-1",
        ghost:
          "bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]",
        destructive:
          "bg-[var(--color-danger)] text-[var(--color-on-brand)] hover:opacity-95 shadow-elev-1",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-[11px]",
        lg: "h-11 px-5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
