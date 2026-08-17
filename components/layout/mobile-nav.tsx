"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, Trophy, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";

/* ── Mobile bottom tab bar ─────────────────────────────────────────────
   Dark --nav-surface in BOTH themes, matching the design spec.
   Only shown when user is logged in.
   ──────────────────────────────────────────────────────────────────── */
const MOBILE_NAV_ITEMS = [
  { href: "/",         label: "Home",       icon: Home },
  { href: "/predict",  label: "Predict",    icon: Activity },
  { href: "/table",    label: "Standings",  icon: Trophy },
  { href: "/rooms",    label: "Leagues",    icon: Users },
  { href: "/me",       label: "Me",         icon: User },
];

export function MobileNav({ userEmail }: { userEmail?: string | null }) {
  const { data: profile } = useProfile(Boolean(userEmail));
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/onboarding");

  const isAuthenticated = Boolean(userEmail || profile);

  if (isAuthPage || !isAuthenticated) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-center px-1.5 py-1.5 shadow-elev-3 pb-[calc(0.375rem+env(safe-area-inset-bottom))]"
      style={{
        background: "var(--nav-surface)",
        borderTop: "1px solid var(--nav-border)",
      }}
    >
      <nav className="flex w-full max-w-mobile items-center justify-around overflow-hidden">
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
                "relative flex flex-1 flex-col items-center justify-center rounded-lg py-1.5 px-0.5 transition-all duration-150 ease-out active:scale-90 text-center touch-manipulation min-h-[var(--tap-min)] min-w-0 cursor-pointer select-none"
              )}
              style={{
                color: isActive
                  ? "var(--nav-accent)"
                  : "var(--nav-text-quiet)",
                background: isActive ? "var(--nav-fill)" : undefined,
              }}
            >
              {isActive && (
                <span
                  className="absolute top-0 h-0.5 w-5 rounded-full"
                  style={{ background: "var(--nav-accent)" }}
                />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform mt-0.5 shrink-0",
                  isActive ? "stroke-[2.5] scale-110" : "stroke-[1.75]"
                )}
              />
              <span className="mt-1 text-[10px] font-heading font-bold leading-none truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
