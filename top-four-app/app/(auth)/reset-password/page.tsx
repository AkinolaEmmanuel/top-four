'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AuthShell } from '../../components/auth/auth-shell';
import { useConfirmPasswordReset } from '@/hooks/api/useAccount';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const confirmReset = useConfirmPasswordReset();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const inputClasses = "flex h-11 w-full rounded-md border border-[var(--border-base)] bg-[var(--surface-canvas)] px-3 py-2 text-sm ring-offset-[var(--surface-canvas)] placeholder:text-[var(--text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[var(--text-primary)]";
  const labelClasses = "text-sm font-medium leading-none text-[var(--text-primary)]";
  const buttonClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-[var(--surface-canvas)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand)]/90 h-11 px-8 py-2 w-full font-bold tracking-wide";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    confirmReset.mutate(
      { token, password },
      {
        onSuccess: () => setDone(true),
        onError: (err: any) => setError(err?.message || 'That link is invalid or has expired.'),
      },
    );
  }

  if (!token) {
    return (
      <AuthShell eyebrow="Reset password" title="Invalid link" subtitle="This reset link is missing its token.">
        <p className="rounded-xl bg-red-900/10 border border-red-900/20 px-3.5 py-2.5 text-sm text-red-500">
          Open the link from your email again, or request a new one.
        </p>
        <Link href="/forgot-password" className="mt-5 block text-center text-sm font-bold text-[var(--text-primary)] hover:text-[var(--color-brand)] hover:underline">
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell eyebrow="Reset password" title="Password updated" subtitle="Every other session has been signed out.">
        <button
          onClick={() => router.push('/')}
          className={buttonClasses}
        >
          Sign in
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Set a new password"
      subtitle="Choose something you haven't used here before."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="password" className={labelClasses}>New password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
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

        <button type="submit" className={buttonClasses} disabled={confirmReset.isPending}>
          {confirmReset.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Set new password
        </button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4 text-xs font-bold font-heading">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
