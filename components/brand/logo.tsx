"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: number;
  className?: string;
};

/**
 * Brand mark — four ascending standings bars, the last (top position)
 * picked out in white. Reads as a table/ranking climb — literally "top
 * four" — rather than a generic sports icon. Each instance gets a unique
 * gradient id via useId so multiple logos can render on one page without
 * colliding <linearGradient> ids.
 */
export function Logo({ size = 32, className }: LogoProps) {
  const gradId = useId();

  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role="img"
      aria-label="topfour.app"
    >
      <rect width="32" height="32" rx="9" fill={`url(#${gradId})`} />
      <rect x="6" y="19" width="4" height="6" rx="1.2" fill="white" fillOpacity="0.45" />
      <rect x="12" y="15" width="4" height="10" rx="1.2" fill="white" fillOpacity="0.7" />
      <rect x="18" y="11" width="4" height="14" rx="1.2" fill="white" fillOpacity="0.9" />
      <rect x="24" y="7" width="4" height="18" rx="1.2" fill="#FACC15" />
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>
    </svg>
  );
}
