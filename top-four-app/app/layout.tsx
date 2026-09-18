import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TopFour — Social Football Prediction Platform',
  description: 'Premier peer-to-peer football prediction leagues with friends and communities.',
};

import { DesktopLevelOne } from './components/DesktopLevelOne';
import { AuthProvider } from '@/context/auth-context';
import { ReactQueryProvider } from '@/context/query-provider';
import { THEME_INIT_SCRIPT } from '@/lib/theme';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-[100dvh] overflow-hidden overscroll-none">
      <head>
        {/* Runs before paint, so a stored dark choice does not flash white. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      {/* The viewport is the page. Screens bound their own scroll region, so the
          body must not grow past the fold — when it did, the root tab bar sat
          209px below it on a 812px phone and the app had no visible navigation.
          `html` needs the same height/overflow lock as `body`: without it, a
          screen whose content runs long (e.g. an auth form plus an error
          banner on a short phone) grows the document past the viewport and
          mobile Safari rubber-band scrolls the whole page instead of a screen's
          own scroll region taking it. `overscroll-none` on both then stops the
          bounce/pull-to-refresh gesture at the edges of whatever *does* scroll. */}
      <body className="h-[100dvh] overflow-hidden overscroll-none bg-[var(--surface-canvas)] text-[var(--text-primary)] antialiased flex flex-col">
        <ReactQueryProvider>
          <AuthProvider>
            <DesktopLevelOne />
            {children}
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
