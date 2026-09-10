'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AuthShell } from '../../components/auth/auth-shell';
import { useVerifyEmail, useResendVerificationEmail } from '@/hooks/api/useAccount';
import { useAuth } from '@/context/auth-context';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const verify = useVerifyEmail();
  const resend = useResendVerificationEmail();
  const { user, refetchUser } = useAuth();
  const [status, setStatus] = useState<'pending' | 'ok' | 'error'>(token ? 'pending' : 'error');
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;
    verify.mutate(token, {
      onSuccess: () => {
        setStatus('ok');
        refetchUser();
      },
      onError: () => setStatus('error'),
    });
  }, [token, verify, refetchUser]);

  const buttonClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-[var(--surface-canvas)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand)]/90 h-11 px-8 py-2 w-full font-bold tracking-wide";

  if (status === 'pending') {
    return (
      <AuthShell eyebrow="Email verification" title="Verifying your email" subtitle="One moment.">
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-brand)]" />
        </div>
      </AuthShell>
    );
  }

  if (status === 'ok') {
    return (
      <AuthShell eyebrow="Email verification" title="Email verified" subtitle="You're all set.">
        <Link href="/home" className={`${buttonClasses} block text-center`}>
          Continue to TopFour
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="Email verification" title="Link invalid or expired" subtitle="That verification link no longer works.">
      <div className="space-y-5">
        {user?.email && (
          <button
            className={buttonClasses}
            disabled={resend.isPending || resend.isSuccess}
            onClick={() => resend.mutate(user.email)}
          >
            {resend.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {resend.isSuccess ? 'New link sent' : 'Send a new link'}
          </button>
        )}
        <Link href="/home" className="block text-center text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:text-[var(--color-brand)] hover:underline">
          Back to TopFour
        </Link>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4 text-xs font-bold font-heading">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
