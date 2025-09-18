import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30분 (세션은 더 오래 캐시)
      gcTime: 60 * 60 * 1000, // 60분 (세션은 더 오래 보관)
      retry: (failureCount, error: any) => {
        // 404 에러는 재시도하지 않음
        if (error?.status === 404) return false;
        // 최대 3번까지 재시도
        return failureCount < 3;
      },
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 리페치 비활성화
      refetchOnReconnect: false, // 네트워크 재연결 시 리페치 비활성화
      refetchOnMount: false, // 컴포넌트 마운트 시 리페치 비활성화 (캐시된 데이터 사용)
      refetchInterval: false, // 주기적 리페치 비활성화
      refetchIntervalInBackground: false, // 백그라운드에서 리페치 비활성화
    },
    mutations: {
      retry: false, // 뮤테이션은 재시도하지 않음
    },
  },
});
