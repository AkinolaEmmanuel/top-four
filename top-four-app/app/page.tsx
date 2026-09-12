'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AuthShell } from './components/auth/auth-shell';
import { GoogleSignInButton } from './components/auth/google-sign-in-button';
import { useAuth } from '@/context/auth-context';
import { ApiError } from '@/lib/api/fetcher';

/** Seconds left until `until`, ticking down and stopping at zero. */
function useCountdown(until: number | null): number {
  const [left, setLeft] = useState(() => remaining(until));

  useEffect(() => {
    if (until === null) { setLeft(0); return; }
    setLeft(remaining(until));
    const timer = setInterval(() => setLeft(remaining(until)), 250);
    return () => clearInterval(timer);
  }, [until]);

  return left;
}

const remaining = (until: number | null) =>
  until === null ? 0 : Math.max(0, Math.ceil((until - Date.now()) / 1000));

const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/home';
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Sign-in is paused until this instant after a 429. Held as a timestamp so
  // the countdown stays honest if the tab is backgrounded and comes back.
  const [pausedUntil, setPausedUntil] = useState<number | null>(null);
  const pausedSeconds = useCountdown(pausedUntil);
  const paused = pausedSeconds > 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (paused) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      // Force a full page reload to ensure middleware gets the freshest cookies
      window.location.href = redirectTarget;
    } catch (err) {
      // A rate limit is waited out for exactly as long as the server said, with
      // no background retry — that loop is what the limit exists to stop.
      if (err instanceof ApiError && err.status === 429) {
        setError(null);
        setPausedUntil(Date.now() + (err.retryAfterSeconds ?? 60) * 1000);
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClasses = "flex h-11 w-full rounded-md border border-[var(--border-base)] bg-[var(--surface-canvas)] px-3 py-2 text-sm ring-offset-[var(--surface-canvas)] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[var(--text-primary)]";
  const labelClasses = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[var(--text-primary)]";
  const buttonClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-[var(--surface-canvas)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand)]/90 h-11 px-8 py-2 w-full font-bold tracking-wide";

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your league"
      subtitle="Enter your details to get back to the leaderboard."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className={labelClasses}>Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClasses}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className={labelClasses}>Password</label>
            <Link href="/forgot-password" className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--color-brand)] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClasses}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => { e.preventDefault(); setShowPassword((prev) => !prev); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] focus:outline-none"
            >
              {showPassword ? (
                <svg className="pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
              ) : (
                <svg className="pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
        </div>

        {paused && (
          <div
            role="status"
            className="rounded-xl border border-[var(--surface-border-strong)] bg-[var(--surface-subtle)] px-3.5 py-3 text-xs sm:text-sm"
          >
            <p className="font-semibold text-[var(--text-primary)]">Too many attempts</p>
            <p className="mt-1.5 leading-relaxed text-[var(--text-secondary)]">
              For your account&apos;s safety, sign-in is paused for a short while. This happens after
              several failed attempts and clears on its own — nothing is locked permanently.
            </p>
            <p className="mt-2 font-bold tracking-wide tabular-nums text-[var(--text-primary)]">
              TRY AGAIN IN {formatCountdown(pausedSeconds)}
            </p>
            <Link href="/forgot-password" className="mt-2 inline-block font-semibold text-[var(--color-brand)] hover:underline">
              Reset your password instead
            </Link>
          </div>
        )}

        {error && !paused && (
          <p className="rounded-xl bg-red-900/10 border border-red-900/20 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-red-500">
            {error}
          </p>
        )}

        <button type="submit" className={buttonClasses} disabled={isSubmitting || paused}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {paused ? `Sign in (${formatCountdown(pausedSeconds)})` : 'Sign in'}
        </button>
      </form>

      {!!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
        <div className="my-5 flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
          <div className="h-px flex-1 bg-[var(--border-base)]" />
          <span>or</span>
          <div className="h-px flex-1 bg-[var(--border-base)]" />
        </div>
      )}

      <GoogleSignInButton redirectTarget={redirectTarget} onError={setError} />

      <p className="mt-5 text-center text-xs sm:text-sm text-[var(--text-secondary)]">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="font-bold text-[var(--text-primary)] hover:text-[var(--color-brand)] hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4 text-xs font-bold font-heading">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
