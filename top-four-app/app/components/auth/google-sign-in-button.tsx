'use client';

import { useEffect, useRef, useState } from 'react';
import { googleChallenge } from '@/lib/api/auth';
import { useAuth } from '@/context/auth-context';

declare global {
  interface Window {
    google?: any;
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
              await signInWithGoogle(response.credential);
              window.location.href = redirectTarget;
            } catch (err: any) {
              onError(err?.message || 'Google sign-in failed. Please try again.');
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
      } catch (err: any) {
        if (!cancelled) onError(err?.message || 'Could not start Google sign-in.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clientId, redirectTarget, onError, signInWithGoogle]);

  if (!clientId) return null;

  return (
    <div className="w-full flex justify-center">
      {loading && <div className="h-11 w-full max-w-[320px] rounded-md bg-[var(--surface-subtle)] animate-pulse" />}
      <div ref={containerRef} className={loading ? 'hidden' : ''} />
    </div>
  );
}
