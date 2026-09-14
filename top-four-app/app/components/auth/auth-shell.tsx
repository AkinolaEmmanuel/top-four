'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FootballBall } from '../brand/football-ball';

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ eyebrow, title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex min-h-[100dvh] w-full bg-[var(--surface-canvas)] text-[var(--text-primary)]">
      {/* Left: Pitch & Football Panel */}
      <div className="relative hidden w-1/2 shrink-0 overflow-hidden bg-slate-950 lg:flex border-r border-slate-800 min-h-[100dvh]">
        {/* dot grid backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[size:28px_28px]"
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
            <div className="font-heading font-bold text-[17px] leading-[1] tracking-[-0.6px]">
              TOPFOUR<span className="text-[var(--color-brand)]">/</span>
            </div>
          </Link>

          <div>
            <motion.div
              aria-hidden
              className="mb-8 w-16 h-16 origin-center"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
            >
              <FootballBall className="h-16 w-16 text-[var(--color-brand)]" />
            </motion.div>

            <h2 className="max-w-sm text-3xl font-black leading-tight tracking-tight text-white uppercase font-heading">
              Create a group. Join a group. Predict with friends.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400 font-sans">
              Predict scorelines, standings, hot takes and let the table or the group settle every argument.
            </p>
          </div>

          <p className="text-xs text-slate-500 font-mono">
            &copy; {new Date().getFullYear()} topfour.app • All rights reserved
          </p>
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="flex flex-1 min-h-[100dvh] items-center justify-center bg-[var(--surface-canvas)] px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--border-base)] bg-[var(--surface-layer-1)] p-6 sm:p-8 shadow-sm">
          {/* Mobile brand mark */}
          <Link
            href="/"
            className="mb-6 flex items-center gap-2 text-[var(--text-primary)] lg:hidden"
          >
            <div className="font-heading font-bold text-[17px] leading-[1] tracking-[-0.6px]">
              TOPFOUR<span className="text-[var(--color-brand)]">/</span>
            </div>
          </Link>

          <p className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-brand)]">
            {eyebrow}
          </p>
          <h1 className="mt-1.5 text-2xl font-black tracking-tight text-[var(--text-primary)] uppercase font-heading">
            {title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] font-sans">{subtitle}</p>

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
