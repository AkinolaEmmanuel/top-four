"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Loader2, Menu, X, ArrowRight, User, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { signOut } from "@/lib/mock-auth/client";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

const APP_NAV_TABS = [
  { href: "/", label: "Dashboard" },
  { href: "/predict", label: "Predictor" },
  { href: "/receipts", label: "My Receipts" },
  { href: "/table", label: "League Table" },
  { href: "/rooms", label: "Rooms & Clubs" },
  { href: "/how-to-play", label: "How to Play" },
];

export function SiteHeader({ userEmail }: { userEmail: string | null }) {
  const { data: profile, isLoading } = useProfile(Boolean(userEmail));
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/onboarding");

  if (isAuthPage) {
    return null;
  }

  const displayName = profile?.displayName || userEmail || "Guest";
  const initials = getInitials(displayName);

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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-8xl items-center justify-between px-4 sm:px-6">

        {/* ── Brand Logo ── */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 transition-transform duration-150 ease-out active:scale-95">
            <Logo size={28} />
            <span className="text-base font-black tracking-tight text-foreground uppercase font-heading">
              TOPFOUR<span className="text-sky-500">.APP</span>
            </span>
          </Link>

          {/* ── Desktop Primary Navigation Tabs ── */}
          <nav className="hidden md:flex items-center gap-1">
            {APP_NAV_TABS.map((tab) => {
              const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-150 ease-out active:scale-95 font-sans",
                    active
                      ? "bg-sky-500/15 border border-sky-500/30 text-sky-500 shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── User Profile / Theme Switcher / Sign In CTAs ── */}
        <div className="flex items-center gap-3">

          {/* Theme Toggle Button (Light ⇄ Dark) */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary text-foreground hover:bg-accent transition-all duration-150 ease-out active:scale-90"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Stadium Mode"}
          >
            {isDark ? <Sun className="h-4 w-4 text-crown" /> : <Moon className="h-4 w-4 text-sky-500" />}
          </button>

          {userEmail ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                {isLoading ? (
                  <span className="inline-block h-4 w-20 animate-pulse rounded bg-secondary" />
                ) : (
                  displayName
                )}
              </span>

              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-1 ring-sky-500/40 transition-all duration-150 ease-out active:scale-95 hover:ring-sky-400 shadow-glow-sky",
                  "bg-sky-500 text-white",
                  isLoading && "opacity-50"
                )}
                title={displayName}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : initials}
              </div>

              <button
                onClick={handleSignOut}
                title="Sign out"
                className="rounded-xl p-2 text-muted-foreground transition-all duration-150 ease-out active:scale-90 hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-bold text-foreground hover:bg-accent transition-all duration-150 ease-out active:scale-[0.97]"
              >
                <User className="h-3.5 w-3.5" />
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white hover:bg-sky-600 transition-all duration-150 ease-out active:scale-[0.97] shadow-glow-sky"
              >
                GET STARTED
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground transition-transform duration-150 ease-out active:scale-90 md:hidden"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Nav Dropdown ── */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800 bg-slate-950 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1.5">
            {APP_NAV_TABS.map((tab) => {
              const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all",
                    active
                      ? "bg-sky-500/15 border border-sky-500/30 text-sky-300"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
