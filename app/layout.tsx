import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { QueryClientProvider } from "@/lib/providers/query-client-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUser } from "@/lib/mock-auth/server";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "topfour.app",
    template: "%s · topfour.app",
  },
  description:
    "Create a group, predict with friends — group chat predictions for the Premier League, Champions League, and more. Global tournaments too.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} dark bg-background font-sans text-foreground antialiased`}>
        <QueryClientProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </QueryClientProvider>
      </body>
    </html>
  );
}

