import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { QueryClientProvider } from "@/lib/providers/query-client-provider";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} font-sans antialiased`}>
        <QueryClientProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </QueryClientProvider>
      </body>
    </html>
  );
}
