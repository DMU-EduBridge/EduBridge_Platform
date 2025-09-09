"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { queryClient } from "@/lib/core/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => queryClient);

  return (
    <SessionProvider>
      <QueryClientProvider client={client}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
