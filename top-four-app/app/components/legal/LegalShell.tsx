'use client';

import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/context/auth-context';

/*
 * Chrome and typography for the two legal pages.
 *
 * Both are public and the root nav hides itself here, so the header carries the
 * only way onward: back into the app for a member, sign-up for everyone else.
 * The page owns its scroll region because `body` is height-locked.
 */

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-[34px] scroll-mt-[24px]">
      <h2 className="font-heading font-bold text-[17px] sm:text-[19px] tracking-[-0.2px] text-[var(--text-primary)]">
        {title}
      </h2>
      <div className="mt-[10px] flex flex-col gap-[12px]">{children}</div>
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-[13.5px] sm:text-[14px] leading-[1.65] text-[var(--text-secondary)]">{children}</p>;
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-[7px]">
      {items.map((item, i) => (
        <li key={i} className="flex gap-[10px] text-[13.5px] sm:text-[14px] leading-[1.6] text-[var(--text-secondary)]">
          <span aria-hidden className="flex-none mt-[8px] w-[4px] h-[4px] rounded-full bg-[var(--color-brand)]" />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Two columns at width, stacked rows on a phone — a real table would scroll. */
export function Pairs({ caption, rows }: { caption: string; rows: [ReactNode, ReactNode][] }) {
  return (
    <div className="mt-[4px] rounded-[12px] border border-[var(--surface-border)] overflow-hidden">
      <div className="tf-kicker text-[var(--text-muted)] px-[14px] py-[10px] bg-[var(--surface-subtle)] border-b border-[var(--surface-border)]">
        {caption}
      </div>
      {rows.map(([left, right], i) => (
        <div
          key={i}
          className={`flex flex-col sm:flex-row sm:gap-[18px] px-[14px] py-[11px] ${i > 0 ? 'border-t border-[var(--surface-border)]' : ''}`}
        >
          <div className="sm:w-[46%] flex-none text-[13px] leading-[1.55] font-heading font-semibold text-[var(--text-primary)]">
            {left}
          </div>
          <div className="mt-[3px] sm:mt-0 min-w-0 text-[13px] leading-[1.55] text-[var(--text-secondary)]">
            {right}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[var(--accent-border)] bg-[var(--accent-surface)] p-[14px_16px]">
      <p className="text-[13.5px] leading-[1.6] text-[var(--accent-text-strong)]">{children}</p>
    </div>
  );
}

export function LegalShell({ title, updated, intro, children }: {
  title: string;
  /** Written out, not computed — a rendered date would differ between server and client. */
  updated: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  const { user } = useAuth();

  /* The page owns its scroll region, and Next's router does not scroll one to
     the hash on a client-side navigation — only a full page load does. So
     /terms linking to /privacy#retention arrived at the top of the policy with
     the section four thousand pixels below. Scroll it ourselves, after a frame
     so the section has been laid out. */
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0 h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)]">
      <header className="flex-none z-20 border-b border-[var(--border-base)] bg-[var(--surface-canvas)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-[var(--gutter)] py-4 sm:px-6">
          <Link href="/" className="font-heading font-bold text-[17px] leading-[1] tracking-[-0.6px] text-[var(--text-primary)]">
            TOPFOUR<span className="text-[var(--color-brand)]">/</span>
          </Link>
          <Link
            href={user ? '/home' : '/sign-up'}
            className="inline-flex items-center justify-center rounded-md h-9 px-4 sm:px-5 text-sm font-bold tracking-wide text-white bg-[var(--brand-fill)] hover:bg-[var(--color-brand-hover)] transition-colors"
          >
            {user ? 'Back to TopFour' : 'Get started'}
          </Link>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto tf-scroll">
        <div className="mx-auto max-w-3xl px-[var(--gutter)] sm:px-6 py-[36px] sm:py-[52px]">
          <h1 className="font-heading font-black text-[28px] sm:text-[36px] leading-[1.08] tracking-[-0.8px] uppercase">
            {title}
          </h1>
          <p className="tf-kicker text-[var(--text-muted)] mt-[12px]">Last updated {updated}</p>
          <div className="mt-[18px] flex flex-col gap-[12px]">{intro}</div>

          {children}

          <footer className="mt-[48px] pt-[22px] border-t border-[var(--surface-border)] flex flex-wrap items-center gap-x-[18px] gap-y-[8px]">
            <Link href="/privacy" className="text-[12.5px] font-heading font-semibold text-[var(--text-link)]">Privacy policy</Link>
            <Link href="/terms" className="text-[12.5px] font-heading font-semibold text-[var(--text-link)]">Terms of service</Link>
            <Link href="/how-to-play" className="text-[12.5px] font-heading font-semibold text-[var(--text-link)]">How to play</Link>
            <span className="text-[12px] text-[var(--text-muted)] ml-auto">© 2026 TopFour</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
