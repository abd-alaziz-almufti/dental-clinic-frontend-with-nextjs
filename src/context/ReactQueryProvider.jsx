"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function ReactQueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays "fresh" for 2 minutes — no refetch on every navigation
            staleTime: 2 * 60 * 1000,
            // Keep cached data for 10 minutes after component unmount
            gcTime: 10 * 60 * 1000,
            // Don't refetch when tab regains focus (reduces noise in clinic apps)
            refetchOnWindowFocus: false,
            // Retry once on failure (covers transient network errors)
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
