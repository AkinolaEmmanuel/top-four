"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/lib/mock-auth/client";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";

type AppHeaderProps = {
  /** Forwarded from the server layout — avoids an extra round-trip for sign-out. */
  userEmail: string;
};

const NAV_TABS = [
  { href: "/dashboard", label: "The Hub" },
  { href: "/dashboard/rooms", label: "Rooms" },
  { href: "/dashboard/global", label: "Global" },
];

export function AppHeader({ userEmail }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();

  const displayName = profile?.full_name ?? profile?.username ?? userEmail;
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
        <Link href="/dashboard" className="flex items-center gap-2">
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
        {NAV_TABS.map((tab) => {
          const active =
            tab.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(tab.href);
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
