'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { AuthShell } from '../auth/auth-shell';
import { useAuth } from '@/context/auth-context';
import { useEstablishInvitationIntent, useConsumeInvitationIntent } from '@/hooks/api/useLeagues';
import type { InvitationIntentPreview, InvitationConsumeOutcome } from '@/lib/api/leagues';

type Credential = { joinCode: string } | { linkToken: string };

export function InviteLanding({ credential, returnPath }: { credential: Credential; returnPath: string }) {
  const { user, isLoading: authLoading } = useAuth();
  const establishIntent = useEstablishInvitationIntent();
  const consumeIntent = useConsumeInvitationIntent();

  const [preview, setPreview] = useState<InvitationIntentPreview | null>(null);
  const [outcome, setOutcome] = useState<InvitationConsumeOutcome | null>(null);
  const [status, setStatus] = useState<'loading' | 'invalid' | 'ready' | 'joining' | 'joined' | 'pending' | 'limit' | 'error'>('loading');

  // Step 1: turn the code/token into an intent. Works whether or not the
  // visitor is signed in -- the capability lives only in an httpOnly cookie.
  useEffect(() => {
    let cancelled = false;
    establishIntent.mutate(credential, {
      onSuccess: (data) => {
        if (cancelled) return;
        setPreview(data);
        setStatus('ready');
      },
      onError: () => {
        if (cancelled) return;
        setStatus('invalid');
      },
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(credential)]);

  // Step 2: once the intent is established AND the visitor is signed in
  // (either already was, or just came back from sign-up/sign-in), consume it.
  useEffect(() => {
    if (status !== 'ready' || authLoading || !user) return;
    setStatus('joining');
    consumeIntent.mutate(undefined, {
      onSuccess: (result) => {
        setOutcome(result);
        setStatus(result.outcome === 'pending' ? 'pending' : 'joined');
      },
      onError: (err: any) => {
        setStatus(err?.data?.code === 'USER_LEAGUE_LIMIT_REACHED' ? 'limit' : 'error');
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, authLoading, user]);

  const signInHref = `/?redirect=${encodeURIComponent(returnPath)}`;
  const signUpHref = `/sign-up?redirect=${encodeURIComponent(returnPath)}`;

  if (status === 'loading' || status === 'joining' || authLoading) {
    return (
      <AuthShell eyebrow="One moment" title="Checking your invitation" subtitle="This only takes a second.">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-brand)]" />
        </div>
      </AuthShell>
    );
  }

  if (status === 'invalid') {
    return (
      <AuthShell eyebrow="Invitation" title="This invitation can't be used" subtitle="It may have expired, been used up, or been withdrawn.">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          For safety we don't say which. Ask whoever invited you for a fresh link.
        </p>
        <Link href="/home" className="mt-6 inline-flex items-center justify-center rounded-md text-sm font-bold tracking-wide h-11 px-8 w-full bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand)]/90 transition-colors">
          Go to my leagues
        </Link>
      </AuthShell>
    );
  }

  if (status === 'limit') {
    return (
      <AuthShell eyebrow="Invitation" title="You're in twenty leagues already" subtitle="Twenty unfinished leagues is the limit.">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Leagues that have finished don't count and stay in your history, so finishing or leaving one makes room. Nothing about this invitation is lost -- come back to the link once you have room.
        </p>
        <Link href="/leagues" className="mt-6 inline-flex items-center justify-center rounded-md text-sm font-bold tracking-wide h-11 px-8 w-full bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand)]/90 transition-colors">
          Choose one to leave
        </Link>
      </AuthShell>
    );
  }

  if (status === 'error') {
    return (
      <AuthShell eyebrow="Invitation" title="Couldn't join that league" subtitle="Something went wrong on our end.">
        <Link href="/home" className="mt-6 inline-flex items-center justify-center rounded-md text-sm font-bold tracking-wide h-11 px-8 w-full bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand)]/90 transition-colors">
          Go to my leagues
        </Link>
      </AuthShell>
    );
  }

  if (status === 'pending') {
    return (
      <AuthShell eyebrow="Invitation" title="Your request is with the owner" subtitle={`${preview?.league.name || 'This league'} approves every join by hand.`}>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          We'll tell you the moment somebody decides. Until then you can't see its fixtures or its table.
        </p>
        <Link href="/home" className="mt-6 inline-flex items-center justify-center rounded-md text-sm font-bold tracking-wide h-11 px-8 w-full bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand)]/90 transition-colors">
          Back to my leagues
        </Link>
      </AuthShell>
    );
  }

  if (status === 'joined') {
    return (
      <AuthShell eyebrow="You're in" title={`${preview?.league.name || 'The league'} is yours to play`} subtitle="Fixtures and questions are ready for predictions.">
        <Link
          href={outcome && 'leagueId' in outcome ? `/leagues/${outcome.leagueId}` : '/home'}
          className="mt-2 inline-flex items-center justify-center rounded-md text-sm font-bold tracking-wide h-11 px-8 w-full bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand)]/90 transition-colors"
        >
          Start predicting
        </Link>
      </AuthShell>
    );
  }

  // status === 'ready', not yet signed in -- show the league preview and ask
  // the visitor to sign in or create an account before joining.
  return (
    <AuthShell eyebrow="You've been invited to" title={preview?.league.name || 'A league'} subtitle="Sign in or create an account to join.">
      <div className="space-y-3">
        <Link
          href={signUpHref}
          className="inline-flex items-center justify-center rounded-md text-sm font-bold tracking-wide h-11 px-8 w-full bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand)]/90 transition-colors"
        >
          Create an account and join
        </Link>
        <Link
          href={signInHref}
          className="inline-flex items-center justify-center rounded-md text-sm font-bold tracking-wide h-11 px-8 w-full border border-[var(--border-base)] text-[var(--text-primary)] hover:bg-[var(--surface-canvas)] transition-colors"
        >
          I already have an account
        </Link>
      </div>
      {preview?.league.joinApprovalRequired && (
        <p className="text-xs text-[var(--text-muted)] mt-4 text-center">The owner approves every join by hand.</p>
      )}
    </AuthShell>
  );
}
