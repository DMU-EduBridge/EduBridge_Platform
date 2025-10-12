'use client';

import { queryClient } from '@/lib/core/query-client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => queryClient);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 클라이언트 사이드에서만 렌더링하여 hydration mismatch 방지
  if (!mounted) {
    return null;
  }

  return (
    <SessionProvider
      refetchInterval={0} // 자동 리페치 완전 비활성화
      refetchOnWindowFocus={false} // 윈도우 포커스 시 리페치 비활성화
      refetchWhenOffline={false} // 오프라인 시 리페치 비활성화
    >
      <QueryClientProvider client={client}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
