import * as React from "react";
import { cn } from "@/lib/utils";

export const CLUB_COLORS: Record<string, string> = {
  ARS: "#c8182f",
  CHE: "#1746a2",
  LIV: "#b7152b",
  TOT: "#17233d",
  MCI: "#559ac7",
  EVE: "#153c85",
  MUN: "#d1262f",
  NEW: "#20242a",
  AVL: "#670e36",
  BHA: "#0057b8",
  WOL: "#fdb913",
  FUL: "#000000",
  CRY: "#1b458f",
  BOU: "#da291c",
  WHU: "#7a263a",
  NFO: "#dd0000",
  BRE: "#e30613",
  IPS: "#00448a",
  LEI: "#003090",
  SOU: "#d71920",
  RMA: "#e6e6e6",
  FCB: "#a50044",
  BAR: "#a50044",
  MIL: "#c8182f",
  INT: "#0068a8",
  BAY: "#dc052d",
  DOR: "#fde100",
  BVB: "#fde100",
  LEV: "#e32219",
  RBL: "#dd0741",
  GER: "#d10214",
  PSG: "#004170",
  JUV: "#000000",
};

interface CrestProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  name?: string;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  xs: "w-[22px] h-[24px] text-[8.5px]",
  sm: "w-[26px] h-[28px] text-[9.5px]",
  md: "w-[30px] h-[33px] text-[10.5px]",
  lg: "w-[38px] h-[41px] text-[11.5px]",
  xl: "w-[44px] h-[48px] text-[13px]",
};

export function Crest({
  code,
  name,
  color,
  size = "md",
  className,
  style,
  ...props
}: CrestProps) {
  const cleanCode = code ? code.trim().slice(0, 3).toUpperCase() : "TOP";
  const bg = color || CLUB_COLORS[cleanCode] || "var(--brand-fill)";
  const isLight = bg === "#e6e6e6" || bg === "#fde100";

  return (
    <div
      className={cn(
        "tf-crest flex items-center justify-center font-bold font-heading shrink-0 select-none",
        sizeClasses[size],
        className
      )}
      style={{
        clipPath: "var(--crest-clip)",
        background: bg,
        color: isLight ? "#111827" : "var(--tf-white)",
        filter: "var(--crest-saturation) drop-shadow(0 0 0.8px var(--crest-edge))",
        ...style,
      }}
      title={name || cleanCode}
      {...props}
    >
      {cleanCode}
    </div>
  );
}
