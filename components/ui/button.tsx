import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-sky-500 text-white hover:bg-sky-600 focus-visible:ring-sky-500 shadow-sm",
        sky: "bg-sky-500 text-white hover:bg-sky-600 focus-visible:ring-sky-500 shadow-sm",
        emerald: "bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-500 shadow-sm",
        crown: "bg-crown text-slate-950 font-bold hover:bg-yellow-400 focus-visible:ring-yellow-400 shadow-sm",
        glow: "bg-sky-500 text-white shadow-glow-sky hover:bg-sky-600 focus-visible:ring-sky-400 font-bold",
        outline:
          "border border-border bg-card text-foreground hover:bg-secondary hover:border-slate-300 dark:hover:border-slate-700 focus-visible:ring-sky-500 shadow-sm",
        ghost: "bg-transparent text-foreground hover:bg-secondary focus-visible:ring-sky-500",
        destructive: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500 shadow-sm",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-6 text-base",
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
