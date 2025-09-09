import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분 (React Query v5에서는 cacheTime 대신 gcTime 사용)
      retry: (failureCount, error: any) => {
        // 404 에러는 재시도하지 않음
        if (error?.status === 404) return false;
        // 최대 3번까지 재시도
        return failureCount < 3;
      },
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 리페치 비활성화
      refetchOnReconnect: true, // 네트워크 재연결 시 리페치 활성화
    },
    mutations: {
      retry: false, // 뮤테이션은 재시도하지 않음
    },
  },
});
