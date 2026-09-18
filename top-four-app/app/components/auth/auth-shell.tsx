'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { FootballBall } from '../brand/football-ball';
import { TopFourLogo } from '../brand/top-four-logo';

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ eyebrow, title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex flex-1 min-h-0 h-full w-full bg-[var(--surface-canvas)] text-[var(--text-primary)]">
      {/* Left: Pitch & Football Panel */}
      <div className="relative hidden w-1/2 shrink-0 overflow-hidden bg-slate-950 lg:flex border-r border-slate-800 h-full">
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
          <div className="w-full flex items-center justify-between gap-2 text-white">
            <Link href="/">
              <TopFourLogo size={17} />
            </Link>

            {/* A plain text link here used to read as part of the header, not
                as something to click — a pill with its own border and fill
                gives it the weight of a real CTA instead of decorative copy. */}
            <Link
              href="/how-to-play"
              className="inline-flex items-center gap-[6px] rounded-full border border-white/30 bg-white/10 px-[14px] py-[7px] font-heading text-[12.5px] font-bold uppercase tracking-wide text-white transition-colors hover:border-white/60 hover:bg-white/20"
            >
              <HelpCircle className="h-[14px] w-[14px] text-[var(--color-brand)]" strokeWidth={2.5} />
              How to play
            </Link>
          </div>

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
              Create a league. Join a league. Predict with friends.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400 font-sans">
              Predict scorelines, standings, hot takes and let the table settle every argument.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <span>&copy; {new Date().getFullYear()} topfour.app</span>
          </div>
        </div>
      </div>

      {/* Right: Form Panel. Its own scroll region — if a tall form plus an
          error banner ever outgrows a short phone's viewport, this scrolls
          in place instead of the whole page growing past the fold. */}
      <div className="flex flex-1 h-full justify-center overflow-y-auto tf-scroll bg-[var(--surface-canvas)] px-[var(--gutter)] pt-8 pb-10 sm:px-6 sm:py-12">
        {/* Top-aligned on a phone, centred once there is room to centre in. */}
        <div className="w-full max-w-sm sm:my-auto">
          {/* No card on a phone. A bordered panel inset from the edges is a
              desktop device: on a screen the form already fills, it reads as a
              box drawn around the whole page for no reason. The chrome starts
              at sm, where the form stops being the entire screen. */}
          <div className="sm:rounded-2xl sm:border sm:border-[var(--border-base)] sm:bg-[var(--surface-layer-1)] sm:p-8 sm:shadow-sm">
            {/* Mobile brand mark */}
            <div className="mb-6 flex items-center justify-between gap-2 lg:hidden">
              <Link href="/" className="flex items-center text-[var(--text-primary)]">
                <TopFourLogo size={17} />
              </Link>
              <Link
                href="/how-to-play"
                className="inline-flex items-center gap-[5px] rounded-full border border-[var(--accent-border)] bg-[var(--accent-surface)] px-[11px] py-[6px] font-heading text-[11px] font-bold uppercase tracking-wide text-[var(--accent-text-strong)]"
              >
                <HelpCircle className="h-[13px] w-[13px]" strokeWidth={2.5} />
                How to play
              </Link>
            </div>

            <p className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-brand)]">
              {eyebrow}
            </p>
            <h1 className="mt-1.5 text-2xl font-black tracking-tight text-[var(--text-primary)] uppercase font-heading">
              {title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] font-sans">{subtitle}</p>

            <div className="mt-6">{children}</div>
          </div>

          {/* The wide layout carries these in the left panel, which is hidden below
              lg — so on a phone nobody signing up could reach the terms they were
              agreeing to. */}
          <div className="lg:hidden mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-mono text-[var(--text-muted)]">
            <Link href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">Terms</Link>
            <span>&copy; {new Date().getFullYear()} topfour.app</span>
          </div>
        </div>
      </div>
    </div>
  );
}
