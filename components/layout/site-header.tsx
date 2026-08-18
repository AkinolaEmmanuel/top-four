"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Loader2, Bell, User, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { signOut } from "@/lib/mock-auth/client";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

/* ── Product nav (Level 1) ─────────────────────────────────────────── */
const LOGGED_IN_NAV = [
  { href: "/", label: "Home" },
  { href: "/predict", label: "Predict" },
  { href: "/table", label: "Standings" },
  { href: "/rooms", label: "Leagues" },
  { href: "/receipts", label: "Results" },
  { href: "/operator", label: "Operator" },
];

const LOGGED_OUT_NAV = [
  { href: "/how-to-play", label: "How to Play" },
];

export function SiteHeader({ userEmail }: { userEmail: string | null }) {
  const { data: profile, isLoading } = useProfile(Boolean(userEmail));
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/onboarding");

  if (isAuthPage) return null;

  const displayName = profile?.displayName || userEmail || "Guest";
  const initials = getInitials(displayName);
  const navTabs = userEmail ? LOGGED_IN_NAV : LOGGED_OUT_NAV;

  function toggleTheme() {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      setIsDark(true);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      toast.error("Sign-out failed. Please try again.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          LEVEL 1 — Product chrome. 56px. Dark in BOTH themes.
          Brand mark · primary nav · alerts · account
         ═══════════════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-40 w-full"
        style={{ background: "var(--nav-surface)" }}
      >
        <div className="mx-auto flex h-14 max-w-mobile md:max-w-content items-center justify-between px-4 sm:px-6 md:px-8 lg:px-10">
          {/* ── Brand + Desktop Nav ── */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2 transition-transform duration-150 ease-out active:scale-95 shrink-0"
            >
              <Logo size={24} />
              <span
                className="text-xs sm:text-sm font-black tracking-tight uppercase font-heading whitespace-nowrap"
                style={{ color: "var(--nav-text)" }}
              >
                TOPFOUR<span style={{ color: "var(--nav-accent)" }}>.APP</span>
              </span>
            </Link>

            {/* Desktop primary nav */}
            <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
              {navTabs.map((tab) => {
                const active =
                  tab.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 lg:px-3 text-[11px] lg:text-xs font-bold transition-all duration-150 ease-out active:scale-95 font-heading whitespace-nowrap",
                      active
                        ? "text-[var(--nav-accent)]"
                        : "text-[var(--nav-text-quiet)] hover:text-[var(--nav-text)] hover:bg-[var(--nav-fill)]"
                    )}
                    style={
                      active
                        ? { background: "var(--nav-fill)" }
                        : undefined
                    }
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ── Right: theme toggle, alerts, account ── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Alert bell */}
            {userEmail && (
              <button
                className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[var(--nav-border)] transition-all duration-150 ease-out active:scale-90 shrink-0"
                style={{
                  background: "var(--nav-fill)",
                  color: "var(--nav-text-quiet)",
                }}
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
            )}

            {userEmail ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/me"
                  className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <span
                    className="hidden text-xs font-bold sm:block truncate max-w-[100px] md:max-w-[140px] font-heading"
                    style={{ color: "var(--nav-text)" }}
                  >
                    {isLoading ? (
                      <span className="inline-block h-4 w-16 sm:w-20 animate-pulse rounded" style={{ background: "var(--nav-fill)" }} />
                    ) : (
                      displayName
                    )}
                  </span>

                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-150 ease-out active:scale-95 shrink-0",
                      isLoading && "opacity-50"
                    )}
                    style={{
                      background: "var(--avatar-surface)",
                      color: "var(--avatar-text)",
                    }}
                    title={displayName}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      initials
                    )}
                  </div>
                </Link>

                {/* Sign out — desktop only */}
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="hidden sm:flex rounded-lg p-1.5 transition-all duration-150 ease-out active:scale-90 shrink-0"
                  style={{ color: "var(--nav-text-faint)" }}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold font-heading transition-all duration-150 ease-out active:scale-[0.97]"
                  style={{
                    background: "var(--brand-fill)",
                    color: "var(--color-on-brand)",
                  }}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150 ease-out active:scale-90 shrink-0"
              style={{
                background: "var(--nav-fill)",
                color: "var(--nav-text-quiet)",
              }}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
