'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/app/components/auth/auth-shell';
import { InviteLanding } from '@/app/components/invite/InviteLanding';

export default function InviteTokenLinkPage() {
  // The token travels in the URL fragment (never sent to the server), so it
  // can only be read client-side after mount.
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [returnPath, setReturnPath] = useState('/join');

  useEffect(() => {
    const match = window.location.hash.match(/token=([^&]+)/);
    setToken(match ? decodeURIComponent(match[1]) : null);
    // Carry the fragment along through a sign-in/sign-up round trip -- a
    // query-string redirect param would otherwise drop it silently.
    setReturnPath(`/join${window.location.hash}`);
  }, []);

  if (token === undefined) {
    return null;
  }

  if (token === null) {
    return (
      <AuthShell eyebrow="Invitation" title="This link is missing its token" subtitle="Ask whoever invited you for a fresh link.">
        <Link href="/home" className="mt-6 inline-flex items-center justify-center rounded-md text-sm font-bold tracking-wide h-11 px-8 w-full bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand)]/90 transition-colors">
          Go to my leagues
        </Link>
      </AuthShell>
    );
  }

  return <InviteLanding credential={{ linkToken: token }} returnPath={returnPath} />;
}
