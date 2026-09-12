'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AuthShell } from '../../components/auth/auth-shell';
import { useConfirmEmailChange } from '@/hooks/api/useAccount';
import { ApiError } from '@/lib/api/fetcher';
import { failureMessage } from '@/lib/api/failure';

function ConfirmEmailChangeForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const confirm = useConfirmEmailChange();
  const [status, setStatus] = useState<'pending' | 'ok' | 'spent' | 'error'>(token ? 'pending' : 'spent');
  const [failed, setFailed] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;
    confirm.mutate(token, {
      onSuccess: () => setStatus('ok'),
      onError: (error: unknown) => {
        // Only the server refusing the token means the link is spent. A 500 or
        // a dead network is our problem, and telling somebody their link
        // expired sends them to request another one that will fail the same way.
        const spent = error instanceof ApiError && error.status >= 400 && error.status < 500;
        setFailed(spent ? null : failureMessage(error, 'We could not confirm it just now.'));
        setStatus(spent ? 'spent' : 'error');
      },
    });
  }, [token, confirm]);

  const buttonClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-[var(--surface-canvas)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand)]/90 h-11 px-8 py-2 w-full font-bold tracking-wide";

  if (status === 'pending') {
    return (
      <AuthShell eyebrow="Email change" title="Confirming your new email" subtitle="One moment.">
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-brand)]" />
        </div>
      </AuthShell>
    );
  }

  if (status === 'ok') {
    return (
      <AuthShell eyebrow="Email change" title="Email address updated" subtitle="Sign in again with your new email to continue — every session was signed out for safety.">
        <Link href="/" className={`${buttonClasses} block text-center`}>
          Sign in
        </Link>
      </AuthShell>
    );
  }

  if (status === 'error') {
    return (
      <AuthShell eyebrow="Email change" title="Couldn't confirm that just now" subtitle={failed ?? 'We could not confirm it just now.'}>
        <p className="rounded-xl bg-[var(--danger-surface)] border border-[var(--danger-border)] px-3.5 py-2.5 text-sm text-[var(--danger-text)] mb-5">
          The link is still good. Open it again in a moment.
        </p>
        <Link href="/" className="block text-center text-sm font-bold text-[var(--text-primary)] hover:text-[var(--color-brand)] hover:underline">
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="Email change" title="Link invalid or expired" subtitle="That confirmation link no longer works.">
      <p className="rounded-xl bg-[var(--danger-surface)] border border-[var(--danger-border)] px-3.5 py-2.5 text-sm text-[var(--danger-text)] mb-5">
        Request the email change again from your account settings, then use the newest link sent to you.
      </p>
      <Link href="/" className="block text-center text-sm font-bold text-[var(--text-primary)] hover:text-[var(--color-brand)] hover:underline">
        Back to sign in
      </Link>
    </AuthShell>
  );
}

export default function ConfirmEmailChangePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4 text-xs font-bold font-heading">Loading...</div>}>
      <ConfirmEmailChangeForm />
    </Suspense>
  );
}
