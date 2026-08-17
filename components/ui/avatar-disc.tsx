import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarDiscProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  id?: string;
  size?: "sm" | "md" | "lg";
}

function getIdentIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 7) + 1;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const sizeClasses = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export function AvatarDisc({
  name,
  id,
  size = "md",
  className,
  ...props
}: AvatarDiscProps) {
  const identNum = getIdentIndex(id || name);
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold font-heading shrink-0 select-none",
        sizeClasses[size],
        className
      )}
      style={{
        background: `var(--ident-${identNum})`,
        color: "var(--text-primary)",
      }}
      title={name}
      {...props}
    >
      {initials}
    </div>
  );
}
