import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase font-heading transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-[var(--accent-border)] bg-[var(--accent-surface)] text-[var(--accent-text)]",
        sky:
          "border-[var(--accent-border)] bg-[var(--accent-surface)] text-[var(--accent-text)]",
        win:
          "border-[var(--success-border)] bg-[var(--success-surface)] text-[var(--prediction-correct)]",
        loss:
          "border-[var(--danger-border)] bg-[var(--danger-surface)] text-[var(--prediction-incorrect)]",
        provisional:
          "border-[var(--warn-border)] bg-[var(--warn-surface)] text-[var(--state-provisional)]",
        crown:
          "border-[var(--warn-border)] bg-[var(--warn-surface)] text-[var(--color-crown)] font-black",
        live:
          "border-[var(--danger-border)] bg-[var(--danger-surface)] text-[var(--state-live)] animate-pulse",
        owner:
          "border-[var(--warn-border)] bg-[var(--warn-surface)] text-[var(--role-owner)]",
        admin:
          "border-[var(--accent-border)] bg-[var(--accent-surface)] text-[var(--role-admin)]",
        participant:
          "border-[var(--surface-border)] bg-[var(--surface-subtle)] text-[var(--role-participant)]",
        locked:
          "border-[var(--surface-border)] bg-[var(--surface-subtle)] text-[var(--state-locked)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
