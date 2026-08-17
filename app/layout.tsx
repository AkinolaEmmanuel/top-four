import type { Metadata } from "next";
import { DM_Sans, Sora } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { QueryClientProvider } from "@/lib/providers/query-client-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getCurrentUser } from "@/lib/mock-auth/server";

/* Typography — design spec assignment:
   DM Sans (--family-primary) → headings, numbers, labels
   Sora    (--family-secondary) → body copy */
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "topfour.app",
    template: "%s · topfour.app",
  },
  description:
    "Create a league, predict with friends — predictions for the Premier League, Champions League, and more.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1120" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${sora.variable} bg-background font-sans text-foreground antialiased relative min-h-screen w-full  overflow-x-hidden ${user ? "pb-20 md:pb-0" : "pb-0"} transition-colors duration-300`}
      >
        <QueryClientProvider>
          <SiteHeader userEmail={user?.email ?? null} />
          <main>{children}</main>
          <MobileNav userEmail={user?.email ?? null} />
          <Toaster position="bottom-right" richColors closeButton />
        </QueryClientProvider>
      </body>
    </html>
  );
}
