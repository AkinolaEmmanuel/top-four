"use client";

import {
  isServer,
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, set staleTime above 0 to prevent an immediate refetch
        // on the client after server-rendering hydrated data.
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  });
}

// Module-level singleton — only lives on the browser side.
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always create a new client so requests are isolated.
    return makeQueryClient();
  }
  // Browser: reuse the existing client so we don't lose the cache
  // on React Suspense re-renders before a boundary is reached.
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function QueryClientProvider({ children }: { children: ReactNode }) {
  // NOTE: Do NOT use useState here. If there is no Suspense boundary between
  // this provider and suspending code, React will throw away the client on
  // the initial render and recreate it — losing all prefetched data.
  const queryClient = getQueryClient();

  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </TanStackQueryClientProvider>
  );
}
