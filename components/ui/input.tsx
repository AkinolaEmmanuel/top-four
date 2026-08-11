import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 sm:h-12 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/60 font-sans transition-all duration-150 ease-out hover:border-sky-500/40 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
