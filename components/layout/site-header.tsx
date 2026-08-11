"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Loader2, Menu, X, ArrowRight, User, Sun, Moon, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { signOut } from "@/lib/mock-auth/client";
import { useProfile } from "@/hooks/use-profile";
import { DemoPersonaSwitcher } from "@/components/auth/demo-persona-switcher";
import { cn } from "@/lib/utils";

const LOGGED_IN_NAV_TABS = [
  { href: "/", label: "Home" },
  { href: "/predict", label: "Predictor" },
  { href: "/receipts", label: "My Receipts" },
  { href: "/table", label: "League Table" },
  { href: "/rooms", label: "My Groups" },
  { href: "/how-to-play", label: "How to Play" },
];

const LOGGED_OUT_NAV_TABS = [
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
  const navTabs = userEmail ? LOGGED_IN_NAV_TABS : LOGGED_OUT_NAV_TABS;

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
            {navTabs.map((tab) => {
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

        {/* ── User Profile / Theme Switcher / Mobile Hamburger ── */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Persona Switcher for Testing */}
          <DemoPersonaSwitcher className="hidden sm:inline-block" />

          {/* Theme Toggle Button (Light ⇄ Dark) */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary text-foreground hover:bg-accent transition-all duration-150 ease-out active:scale-90 shrink-0"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="h-4 w-4 text-crown" /> : <Moon className="h-4 w-4 text-sky-500" />}
          </button>

          {userEmail ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden text-xs font-bold text-foreground sm:block truncate max-w-[140px]">
                {isLoading ? (
                  <span className="inline-block h-4 w-20 animate-pulse rounded bg-secondary" />
                ) : (
                  displayName
                )}
              </span>

              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-1 ring-sky-500/40 transition-all duration-150 ease-out active:scale-95 hover:ring-sky-400 shadow-glow-sky shrink-0",
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
                className="hidden sm:flex rounded-xl p-2 text-muted-foreground transition-all duration-150 ease-out active:scale-90 hover:bg-secondary hover:text-foreground shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2.5">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3.5 py-2 text-xs font-bold text-foreground hover:bg-accent transition-all duration-150 ease-out active:scale-[0.97]"
              >
                <User className="h-3.5 w-3.5" />
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-sky-600 transition-all duration-150 ease-out active:scale-[0.97] shadow-glow-sky"
              >
                GET STARTED
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary text-foreground hover:bg-accent transition-all duration-150 ease-out active:scale-90 md:hidden shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </div>

      {/* ── Mobile Responsive Dropdown Drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card/95 backdrop-blur-2xl px-4 py-4 space-y-4 shadow-xl">
          {/* Options not in bottom navigation bar */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block px-2 pb-1">
              MORE OPTIONS & GUIDES
            </span>
            <Link
              href="/how-to-play"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-150 ease-out active:scale-[0.98]",
                pathname === "/how-to-play"
                  ? "bg-sky-500/15 text-sky-500 border border-sky-500/30"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-sky-400" />
                How to Play Guide
              </span>
              <ArrowRight className="h-3.5 w-3.5 opacity-50" />
            </Link>

            <Link
              href="/rooms/new"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-150 ease-out active:scale-[0.98]",
                pathname === "/rooms/new"
                  ? "bg-sky-500/15 text-sky-500 border border-sky-500/30"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-sky-400 font-black">+</span>
                Create a group
              </span>
              <ArrowRight className="h-3.5 w-3.5 opacity-50" />
            </Link>
          </div>

          {/* Account & Auth Controls */}
          <div className="pt-3 border-t border-border space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block px-2">
              ACCOUNT & AUTH
            </span>

            {userEmail ? (
              <div className="flex items-center justify-between w-full p-2.5 rounded-xl border border-border bg-secondary/50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{userEmail}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-bold shrink-0 hover:bg-destructive/20 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 w-full pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-bold text-foreground hover:bg-accent transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-sky-400" />
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-white shadow-glow-sky hover:bg-sky-600 transition-colors"
                >
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
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
