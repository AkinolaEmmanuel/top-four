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
    <div className="flex min-h-screen bg-white dark:bg-white">
      {/* ── Left: black football panel ── */}
      <div className="relative hidden w-1/2 shrink-0 overflow-hidden bg-black lg:flex">
        {/* dot grid backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] bg-[size:28px_28px]"
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
            <span className="text-base font-semibold tracking-tight">topfour.app</span>
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
              <FootballBall className="h-16 w-16 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-sm text-3xl font-bold leading-tight tracking-tight text-white"
            >
              Create a group. Predict with friends.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-3 max-w-sm text-sm leading-relaxed text-white/50"
            >
              Predict scores in your group chat — or the world&apos;s
              biggest one — and let the table settle every argument.
            </motion.p>
          </div>

          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} topfour.app
          </p>
        </div>
      </div>

      {/* ── Right: white form panel ── */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          {/* Mobile brand mark */}
          <Link
            href="/"
            className="mb-8 flex items-center gap-2 text-black lg:hidden"
          >
            <Logo size={32} />
            <span className="text-base font-semibold tracking-tight">topfour.app</span>
          </Link>

          <p className="text-xs font-semibold uppercase tracking-widest text-black/40">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-black">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-black/50">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
