'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useResendVerificationEmail } from '@/hooks/api/useAccount';
import { failureMessage } from '@/lib/api/failure';

/**
 * Shown only to a signed-in member whose email is not yet verified.
 *
 * The API refuses predictions, joins and new leagues until it is, so this says
 * so before anyone does the work, rather than after a save fails. "I've
 * verified" covers the member who opened the link on another device: the
 * session reloads the account, so nothing else has to happen.
 */
export function VerifyEmailBanner({ className = '' }: { className?: string }) {
  const { user, refetchUser } = useAuth();
  const resend = useResendVerificationEmail();
  const [checking, setChecking] = useState(false);
  const [stillUnverified, setStillUnverified] = useState(false);

  if (!user || user.emailVerified) return null;

  const recheck = async () => {
    setChecking(true);
    setStillUnverified(false);
    await refetchUser();
    setChecking(false);
    // Only reached while still unverified: a verified account unmounts this.
    setStillUnverified(true);
  };

  return (
    <div
      role="status"
      className={`rounded-[13px] border border-[var(--surface-border)] bg-[var(--accent-surface)] shadow-[inset_3px_0_0_0_var(--color-brand)] p-[13px_15px] ${className}`}
    >
      <div className="tf-kicker text-[var(--color-brand)]">Verify your email</div>
      <p className="text-[12.5px] leading-[1.55] text-[var(--text-secondary)] mt-[7px]">
        You need a verified email to make predictions and join leagues. We sent a link to{' '}
        <span className="font-semibold text-[var(--text-primary)] break-all">{user.email}</span>.
      </p>
      <div className="flex flex-wrap items-center gap-x-[18px] gap-y-[8px] mt-[10px]">
        <button
          type="button"
          onClick={() => resend.mutate(user.email)}
          disabled={resend.isPending || resend.isSuccess}
          className="font-heading font-bold text-[10.5px] tracking-[0.05em] text-[var(--text-link)] disabled:opacity-60"
        >
          {resend.isSuccess ? 'LINK SENT' : resend.isPending ? 'SENDING…' : 'RESEND LINK'}
        </button>
        <button
          type="button"
          onClick={recheck}
          disabled={checking}
          className="font-heading font-bold text-[10.5px] tracking-[0.05em] text-[var(--text-link)] disabled:opacity-60"
        >
          {checking ? 'CHECKING…' : 'I’VE VERIFIED'}
        </button>
      </div>
      {resend.isError && (
        <p role="alert" className="text-[11px] text-[var(--danger-text)] mt-[8px]">
          {failureMessage(resend.error, 'That did not send. Try again.')}
        </p>
      )}
      {stillUnverified && !checking && (
        <p className="text-[11px] text-[var(--text-muted)] mt-[8px]">
          Not verified yet. Open the link in the email, then try again.
        </p>
      )}
    </div>
  );
}
