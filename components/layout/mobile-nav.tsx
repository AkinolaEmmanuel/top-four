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
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-2 md:hidden">
      <nav className="pointer-events-auto flex w-[96%] max-w-md items-center justify-around rounded-2xl border border-sky-500/20 bg-slate-950/95 px-1.5 py-2 shadow-elevation-dark-2 backdrop-blur-xl">
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
                "flex flex-col items-center justify-center rounded-xl px-2 py-1.5 transition-all duration-150 ease-out active:scale-90 text-center",
                isActive
                  ? "bg-sky-500/15 text-sky-400 font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5]" : "stroke-[1.75]")} />
              <span className="mt-1 text-[9px] font-mono leading-none truncate max-w-[64px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
