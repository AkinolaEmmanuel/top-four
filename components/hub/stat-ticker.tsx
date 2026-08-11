"use client";

import { motion } from "framer-motion";

export function StatTicker() {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base border-t border-border/50 pt-4 mt-6">
      <div className="flex items-center gap-1.5">
        <span className="font-heading font-bold text-foreground">2,847</span>
        <span className="font-sans text-muted-foreground text-xs sm:text-sm">picks made</span>
      </div>
      <span className="text-muted-foreground/30 hidden sm:inline-block">•</span>
      <div className="flex items-center gap-1.5">
        <span className="font-heading font-bold text-foreground">41</span>
        <span className="font-sans text-muted-foreground text-xs sm:text-sm">active groups</span>
      </div>
      <span className="text-muted-foreground/30 hidden sm:inline-block">•</span>
      <div className="flex items-center gap-1.5">
        <span className="font-heading font-bold text-foreground">8</span>
        <span className="font-sans text-muted-foreground text-xs sm:text-sm">matches live today</span>
      </div>
    </div>
  );
}
