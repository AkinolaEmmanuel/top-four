'use client';

/**
 * The last resort: a failure in the root layout itself.
 *
 * This replaces the whole document, so it cannot use the app's chrome or its
 * tokens — the stylesheet is part of what may have failed. Everything here is
 * self-contained and deliberately plain.
 */
export default function GlobalError({
  error, reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#09111d', color: '#f3f6fa', fontFamily: "'Sora', system-ui, sans-serif" }}>
        <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
          <div style={{ maxWidth: 420, textAlign: 'center' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>
              Something went wrong at our end
            </h1>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#b3bdca', marginTop: 10 }}>
              This one is not your connection and not anything you did. Nothing you had saved is affected.
            </p>
            {error.digest && (
              <p style={{ fontSize: 11.5, color: '#9aa6b5', marginTop: 18, fontFamily: 'ui-monospace, monospace' }}>
                Reference {error.digest}
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 22, height: 48, padding: '0 24px', borderRadius: 12, border: 'none',
                background: '#087bb8', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
