'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { googleChallenge } from '@/lib/api/auth';
import { failureMessage } from '@/lib/api/failure';
import { useAuth } from '@/context/auth-context';

/**
 * The slice of Google Identity Services this button actually calls.
 *
 * Declared rather than pulled in as a dependency: the library is a script tag,
 * and these three members are the whole of our contact with it. A wider `any`
 * would let a typo through at the one place the compiler cannot check.
 */
interface GoogleIdentity {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        nonce: string;
        callback: (response: { credential: string }) => void;
      }): void;
      renderButton(parent: HTMLElement, options: {
        type: 'standard' | 'icon';
        theme: 'outline' | 'filled_blue' | 'filled_black';
        size: 'small' | 'medium' | 'large';
        width?: number;
        text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      }): void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window !== 'undefined' && window.google?.accounts?.id) {
    return Promise.resolve();
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Could not load Google sign-in'));
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export function GoogleSignInButton({
  redirectTarget,
  onError,
}: {
  redirectTarget: string;
  onError: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { signInWithGoogle } = useAuth();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [loading, setLoading] = useState(true);
  /* Bumped to fetch a fresh nonce and re-arm the button. The challenge the API
     issues lasts ten minutes and is spent on first use, while this button can
     sit on an open tab far longer than that and has to survive a failed
     attempt. Without this the nonce is only refreshed by an unrelated re-render
     of the auth context, which is luck rather than design. */
  const [attempt, setAttempt] = useState(0);
  const rearm = useCallback(() => setAttempt(n => n + 1), []);

  /* Held in refs, and deliberately out of the effect's dependencies. Neither is
     memoised by its caller, so depending on them re-ran this effect on every
     unrelated render of the auth context and fetched a challenge each time.
     Keeping them here leaves the three refresh points below as the only ones. */
  const signInRef = useRef(signInWithGoogle);
  const onErrorRef = useRef(onError);
  signInRef.current = signInWithGoogle;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    (async () => {
      try {
        await loadGoogleIdentityScript();
        const { nonce } = await googleChallenge();
        if (cancelled || !containerRef.current || !window.google) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          nonce,
          callback: async (response: { credential: string }) => {
            try {
              await signInRef.current(response.credential);
              window.location.href = redirectTarget;
            } catch (error) {
              onErrorRef.current(failureMessage(error, 'Google sign-in failed. Please try again.'));
              // The nonce is spent either way, so a second click on the same one
              // would fail for a reason the member cannot see or act on.
              rearm();
            }
          },
        });

        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
        });
        setLoading(false);
      } catch (error) {
        if (!cancelled) onErrorRef.current(failureMessage(error, 'Could not start Google sign-in.'));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clientId, redirectTarget, rearm, attempt]);

  /* Coming back to a tab is the ordinary way a nonce goes stale: open sign-in,
     go elsewhere, return after the ten minutes are up. Refreshing on the way
     back costs one request and saves a failure the member cannot diagnose. */
  useEffect(() => {
    if (!clientId) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') rearm();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [clientId, rearm]);

  if (!clientId) return null;

  return (
    <div className="w-full flex flex-col items-center gap-[10px]">
      {loading && <div className="h-11 w-full max-w-[320px] rounded-md bg-[var(--surface-subtle)] animate-pulse" />}
      <div ref={containerRef} className={loading ? 'hidden' : ''} />

      {/* Google sign-in creates an account when none exists, so this button is a
          sign-up path on the sign-in screen too. The terms are stated here
          rather than gated behind a tick: a returning member should not have to
          confirm their age every time they sign in.

          Shown whenever we offer the button, not only once Google's script has
          answered. Tying it to that made the terms disappear exactly when the
          script was slow or blocked. */}
      <p className="max-w-[320px] text-center text-[11px] leading-[1.5] text-[var(--text-tertiary)]">
        By continuing with Google you confirm you are 18 or over and accept our{' '}
        <Link href="/terms" target="_blank" rel="noreferrer" className="underline hover:text-[var(--text-secondary)]">terms</Link>
        {' '}and{' '}
        <Link href="/privacy" target="_blank" rel="noreferrer" className="underline hover:text-[var(--text-secondary)]">privacy policy</Link>.
      </p>
    </div>
  );
}
