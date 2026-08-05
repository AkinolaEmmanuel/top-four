"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, Receipt, Trophy, Users, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/predict", label: "Predictor", icon: Activity },
  { href: "/receipts", label: "Receipts", icon: Receipt },
  { href: "/table", label: "Table", icon: Trophy },
  { href: "/rooms", label: "Rooms", icon: Users },
  { href: "/how-to-play", label: "Guide", icon: BookOpen },
];

export function MobileNav() {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/onboarding");

  if (isAuthPage) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 border-t border-border backdrop-blur-2xl px-2 py-1.5 shadow-2xl pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
      <nav className="flex w-full items-center justify-around">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center rounded-xl py-1.5 px-0.5 transition-all duration-150 ease-out active:scale-90 text-center touch-manipulation min-h-[48px]",
                isActive
                  ? "bg-sky-500/15 text-sky-500 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute top-0 h-1 w-6 rounded-full bg-sky-500 shadow-glow-sky" />
              )}
              <Icon className={cn("h-5 w-5 transition-transform mt-0.5", isActive ? "stroke-[2.5] scale-110" : "stroke-[1.75]")} />
              <span className="mt-1 text-[10px] font-mono leading-none truncate max-w-[56px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
