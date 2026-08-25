'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AuthShell } from './components/auth/auth-shell';
import { useAuth } from '@/context/auth-context';

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      // Force a full page reload to ensure middleware gets the freshest cookies
      window.location.href = redirectTarget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
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
      title="Sign in to your group"
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
          <label htmlFor="password" className={labelClasses}>Password</label>
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

        {error && (
          <p className="rounded-xl bg-red-900/10 border border-red-900/20 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-red-500">
            {error}
          </p>
        )}

        <button type="submit" className={buttonClasses} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sign in
        </button>
      </form>

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
