import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-sky-500/30 bg-sky-500/10 text-sky-400",
        sky: "border-sky-500/30 bg-sky-500/10 text-sky-400",
        win: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        loss: "border-red-500/30 bg-red-500/10 text-red-400",
        provisional: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
        crown: "border-yellow-500/40 bg-yellow-500/20 text-yellow-300 font-bold",
        live: "border-red-500/40 bg-red-500/20 text-red-400 animate-pulse font-bold",
        owner: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400 font-semibold",
        admin: "border-sky-500/40 bg-sky-500/10 text-sky-400 font-semibold",
        participant: "border-slate-700 bg-slate-800/50 text-slate-400",
        locked: "border-slate-800 bg-slate-900 text-slate-500",
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
