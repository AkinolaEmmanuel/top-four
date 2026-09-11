'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { AuthShell } from '../../components/auth/auth-shell';
import { useRequestPasswordReset } from '@/hooks/api/useAccount';

export default function ForgotPasswordPage() {
  const requestReset = useRequestPasswordReset();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClasses = "flex h-11 w-full rounded-md border border-[var(--border-base)] bg-[var(--surface-canvas)] px-3 py-2 text-sm ring-offset-[var(--surface-canvas)] placeholder:text-[var(--text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[var(--text-primary)]";
  const labelClasses = "text-sm font-medium leading-none text-[var(--text-primary)]";
  const buttonClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-[var(--surface-canvas)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand)]/90 h-11 px-8 py-2 w-full font-bold tracking-wide";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    requestReset.mutate(email, {
      onSuccess: () => setSubmitted(true),
      onError: (err: any) => setError(err?.message || 'Something went wrong.'),
    });
  }

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to set a new one."
    >
      {submitted ? (
        <div className="space-y-5">
          <p className="rounded-xl bg-[var(--accent-surface)] border border-[var(--color-brand)] px-3.5 py-3 text-sm text-[var(--text-primary)]">
            If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox.
          </p>
          <Link href="/" className="block text-center text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:text-[var(--color-brand)] hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
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

          {error && (
            <p className="rounded-xl bg-red-900/10 border border-red-900/20 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-red-500">
              {error}
            </p>
          )}

          <button type="submit" className={buttonClasses} disabled={requestReset.isPending}>
            {requestReset.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send reset link
          </button>

          <p className="text-center text-xs sm:text-sm text-[var(--text-secondary)]">
            <Link href="/" className="font-bold text-[var(--text-primary)] hover:text-[var(--color-brand)] hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
