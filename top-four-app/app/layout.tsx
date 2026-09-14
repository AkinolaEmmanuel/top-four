import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TopFour — Social Football Prediction Platform',
  description: 'Premier peer-to-peer football prediction leagues with friends and communities.',
};

import { DesktopLevelOne } from './components/DesktopLevelOne';
import { AuthProvider } from '@/context/auth-context';
import { ReactQueryProvider } from '@/context/query-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-[100dvh] bg-[var(--surface-canvas)] text-[var(--text-primary)] antialiased flex flex-col md:h-[100dvh]">
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
