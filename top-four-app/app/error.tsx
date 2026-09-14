'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-6 text-center bg-[var(--surface-canvas)] text-[var(--text-primary)]">
      <div className="w-14 h-14 rounded-full bg-[rgba(239,68,68,0.1)] border border-[var(--color-danger)] grid place-items-center mb-5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--danger-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>
      <h1 className="font-heading font-bold text-[19px] tracking-[-0.3px]">Something went wrong</h1>
      <p className="text-[13px] text-[var(--text-secondary)] mt-[8px] max-w-[360px] leading-[1.5]">
        That page hit an unexpected error. It's on our side, not yours — try again, or head back home.
      </p>
      <div className="flex items-center gap-[10px] mt-[22px]">
        <button
          onClick={reset}
          className="h-[42px] px-[20px] rounded-[11px] bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90 text-white font-heading font-bold text-[13px] transition-colors cursor-pointer"
        >
          Try again
        </button>
        <Link
          href="/home"
          className="h-[42px] px-[20px] grid place-items-center rounded-[11px] border border-[var(--surface-border-strong)] hover:bg-[var(--surface-subtle)] font-heading font-semibold text-[13px] text-[var(--text-secondary)] transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
