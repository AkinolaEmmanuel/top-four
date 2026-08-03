"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { MARKETING_IMAGES } from "@/lib/marketing/images";
import { signOut } from "@/lib/mock-auth/client";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

const MARKETING_NAV_TABS = [
  { href: "#rooms", label: "Rooms" },
  { href: "#global", label: "Global" },
  { href: "#how-it-works", label: "How it works" },
];

const APP_NAV_TABS = [
  { href: "/", label: "The Hub" },
  { href: "/rooms", label: "Rooms" },
  { href: "/global", label: "Global" },
];

/**
 * Mounted once in the root layout. Renders the marketing hero header when
 * logged out, or the slim in-app bar when logged in — one persistent shell
 * across the whole site instead of two unrelated per-route headers.
 */
export function SiteHeader({ userEmail }: { userEmail: string | null }) {
  const { data: profile, isLoading } = useProfile(Boolean(userEmail));

  if (!userEmail) {
    return <LoggedOutHeader />;
  }

  return <LoggedInHeader userEmail={userEmail} profile={profile} isLoading={isLoading} />;
}

function LoggedOutHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="z-50 border-b border-border bg-black">
      {/* ── Logo band — its own section, with an actual footballer photo flexed next to the wordmark, FPL-header style ── */}
      <div className="bg-gradient-to-r from-[#0A0A0A] to-[#262626]">
        <div className="mx-auto flex h-40 max-w-6xl items-center justify-between px-6">
          <Link href="#top" className="flex w-full items-center justify-between">
            <span className="flex items-center gap-2">
              <Logo size={40} />
              <span className="text-2xl font-bold tracking-tight text-white">topfour.app</span>
            </span>

            <span className="relative h-32 w-60 shrink-0 overflow-hidden">
              <Image
                src={MARKETING_IMAGES.huddleRed}
                alt=""
                fill
                priority
                className="object-cover [mask-image:radial-gradient(ellipse_65%_75%_at_center,black_55%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_65%_75%_at_center,black_55%,transparent_100%)]"
                sizes="240px"
              />
            </span>
          </Link>

          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="p-2 text-white md:hidden"
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Primary tabs — same FPL-style horizontal nav the dashboard uses, flexed against auth actions on desktop ── */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 p-6">
        <div className="flex items-center gap-6 overflow-x-auto">
          {MARKETING_NAV_TABS.map((tab) => (
            <a
              key={tab.href}
              href={tab.href}
              className="whitespace-nowrap border-b-2 border-transparent py-3 text-lg font-bold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {tab.label}
            </a>
          ))}
        </div>

        <div className="hidden shrink-0 items-center gap-4 md:flex">
          <Link
            href="/login"
            className="text-base font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-primary px-4 py-2 text-base font-bold text-primary-foreground transition-transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {mobileNavOpen && (
        <div className="border-t border-border bg-card px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {MARKETING_NAV_TABS.map((tab) => (
              <a
                key={tab.href}
                href={tab.href}
                onClick={() => setMobileNavOpen(false)}
                className="text-sm font-bold text-foreground"
              >
                {tab.label}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-4 border-t border-border pt-4">
              <Link href="/login" className="text-sm font-bold text-foreground">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function LoggedInHeader({
  userEmail,
  profile,
  isLoading,
}: {
  userEmail: string;
  profile: Profile | undefined;
  isLoading: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const displayName = profile?.displayName || userEmail;
  const initials = getInitials(displayName);

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      toast.error("Sign-out failed. Please try again.");
      return;
    }

    // router.refresh() tells Next.js to revalidate the Server Component tree
    // so the user is truly logged out on the server side as well.
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      {/* ── Brand row ── */}
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={26} />
          <span className="text-sm font-bold tracking-tight">topfour.app</span>
        </Link>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
              "bg-primary text-primary-foreground",
              isLoading && "opacity-50"
            )}
            title={displayName}
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : initials}
          </div>

          <span className="hidden text-sm font-medium text-foreground sm:block">
            {isLoading ? (
              <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted" />
            ) : (
              displayName
            )}
          </span>

          <button
            onClick={handleSignOut}
            title="Sign out"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Primary tabs — FPL-style horizontal nav, not a sidebar ── */}
      <nav className="mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-6">
        {APP_NAV_TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "whitespace-nowrap border-b-2 py-3 text-sm font-semibold transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
