'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '24px',
          background: '#0b0d10',
          color: '#f4f5f6',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: '19px', fontWeight: 700, margin: 0 }}>
          TopFour hit a problem
        </h1>
        <p style={{ fontSize: '13px', color: '#9aa0a8', marginTop: '8px', maxWidth: '360px', lineHeight: 1.5 }}>
          Something went wrong loading the app itself. Reloading usually fixes it.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '22px',
            height: '42px',
            padding: '0 20px',
            borderRadius: '11px',
            border: 'none',
            background: '#45bceb',
            color: '#04121a',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
