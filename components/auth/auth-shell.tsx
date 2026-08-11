"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { FootballBall } from "@/components/brand/football-ball";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ eyebrow, title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ── Left: Pitch & Football Panel ── */}
      <div className="relative hidden w-1/2 shrink-0 overflow-hidden bg-slate-950 lg:flex border-r border-border">
        {/* dot grid backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#0055ff22_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[size:28px_28px]"
        />

        {/* pitch markings */}
        <svg
          aria-hidden
          viewBox="0 0 400 800"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.15]"
          fill="none"
        >
          <line x1="0" y1="400" x2="400" y2="400" stroke="white" strokeWidth="2" />
          <circle cx="200" cy="400" r="90" stroke="white" strokeWidth="2" />
          <circle cx="200" cy="400" r="3" fill="white" />
          <rect x="60" y="0" width="280" height="110" stroke="white" strokeWidth="2" />
          <rect x="60" y="690" width="280" height="110" stroke="white" strokeWidth="2" />
        </svg>

        <div className="relative flex flex-1 flex-col justify-between p-10">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Logo size={32} />
            <span className="text-base font-bold tracking-tight font-heading">topfour.app</span>
          </Link>

          <div>
            <motion.div
              aria-hidden
              className="mb-8"
              animate={{ y: [0, -16, 0], rotate: 360 }}
              transition={{
                y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 9, repeat: Infinity, ease: "linear" },
              }}
            >
              <FootballBall className="h-16 w-16 text-sky-400" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-sm text-3xl font-black leading-tight tracking-tight text-white uppercase font-heading"
            >
              Create a room. Predict with friends.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400 font-sans"
            >
              Predict scorelines in your private prediction clubs — or the global leaderboard — and let the table settle every argument.
            </motion.p>
          </div>

          <p className="text-xs text-slate-500 font-mono">
            &copy; {new Date().getFullYear()} topfour.app • All rights reserved
          </p>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-8 sm:px-6 sm:py-12 pb-24 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm dark:shadow-elevation-dark-2"
        >
          {/* Mobile brand mark */}
          <Link
            href="/"
            className="mb-6 flex items-center gap-2 text-foreground lg:hidden"
          >
            <Logo size={32} />
            <span className="text-base font-extrabold tracking-tight font-heading">topfour.app</span>
          </Link>

          <p className="text-xs font-mono font-bold uppercase tracking-widest text-sky-500">
            {eyebrow}
          </p>
          <h1 className="mt-1.5 text-2xl font-black tracking-tight text-foreground uppercase font-heading">
            {title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-sans">{subtitle}</p>

          <div className="mt-6">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
