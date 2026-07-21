"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { PURPLE, GREEN } from "@/lib/brand/colors";

const NAV_LINKS = [
  { href: "#competitions", label: "Competitions" },
  { href: "#how-it-works", label: "How it works" },
];

export function SiteNav() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 32);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-black/10 bg-white/90 backdrop-blur-md"
          : "border-b border-white/0 bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="#top" className="flex items-center gap-2.5">
          <Logo size={32} />
          <span
            className={cn(
              "text-base font-bold tracking-tight transition-colors",
              scrolled ? "text-black" : "text-white"
            )}
          >
            topfour.app
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "group relative text-sm font-medium transition-colors",
                scrolled ? "text-black/70 hover:text-black" : "text-white/80 hover:text-white"
              )}
            >
              {link.label}
              <span
                className="absolute -bottom-1 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
                style={{ backgroundColor: scrolled ? PURPLE : GREEN }}
              />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className={cn(
              "text-sm font-medium transition-colors",
              scrolled ? "text-black/70 hover:text-black" : "text-white/80 hover:text-white"
            )}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full px-4 py-2 text-sm font-bold text-black transition-transform hover:scale-105"
            style={{ backgroundColor: GREEN }}
          >
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setMobileNavOpen((v) => !v)}
          className={cn("p-2 md:hidden", scrolled ? "text-black" : "text-white")}
          aria-label="Toggle menu"
        >
          {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileNavOpen && (
        <div className="border-t border-black/10 bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className="text-sm font-medium text-black/70"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-4 border-t border-black/10 pt-4">
              <Link href="/login" className="text-sm font-medium">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full px-4 py-2 text-sm font-bold text-black"
                style={{ backgroundColor: GREEN }}
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
