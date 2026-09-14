'use client';

import { useEffect, useState } from 'react';
import { ProblemState } from './components/ProblemState';
import { ApiError } from '@/lib/api/fetcher';

/**
 * The unexpected-failure boundary.
 *
 * Two states, because the commonest reason a page throws is that the device
 * lost its connection, and telling someone "something went wrong at our end"
 * when their wifi dropped is simply wrong.
 *
 * The reference is the API's `requestId` where we have one; Next.js strips the
 * details off server-side errors in production and leaves only `digest`, so
 * that stands in when it does. Neither is the raw `detail` string, which stays
 * in the logs where it belongs.
 */
export default function AppError({
  error, reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Read at mount rather than during render: navigator is not there on the
    // server, and the value can change while this screen is open.
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  useEffect(() => {
    console.error('[unhandled]', error);
  }, [error]);

  if (offline) {
    return (
      <ProblemState
        icon="cloud"
        title="You're offline"
        body="TopFour needs a connection. Predictions are never queued to send later — a deadline could pass while an answer sat on your phone, and you would believe it was in."
      >
        <RetryButton onRetry={reset} label="Try again" />
      </ProblemState>
    );
  }

  // `digest` lives on the boundary's own error object, so it is read before
  // narrowing to ApiError drops the intersection.
  const digest = error.digest;
  const reference = error instanceof ApiError ? error.requestId ?? digest : digest;

  return (
    <ProblemState
      icon="warn"
      tone="warn"
      title="Something went wrong at our end"
      body="This one is not your connection and not anything you did. Nothing you had saved is affected. If it keeps happening, quoting the reference below lets us find this exact request."
      reference={reference}
    >
      <RetryButton onRetry={reset} label="Try again" />
    </ProblemState>
  );
}

function RetryButton({ onRetry, label }: { onRetry: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onRetry}
      className="tf-tap mt-[22px] h-[48px] px-[24px] rounded-[12px] bg-[var(--brand-fill)] text-[var(--color-on-brand)] grid place-items-center font-heading font-bold text-[13.5px]"
    >
      {label}
    </button>
  );
}
