import type { DashboardOverview } from '@/types';
import { useQuery } from '@tanstack/react-query';

// DashboardOverview 타입은 '@/types'에서 가져옵니다

interface DashboardOverviewResponse {
  success: boolean;
  data: DashboardOverview;
}

/**
 * 대시보드 전체 데이터를 한 번에 가져오는 훅
 */
export function useDashboardOverview() {
  return useQuery<DashboardOverviewResponse>({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/overview');

      if (!response.ok) {
        throw new Error('대시보드 데이터를 가져오는데 실패했습니다.');
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2분
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 새로고침
  });
}

/**
 * 대시보드 개요 데이터를 가져오는 훅 (데이터만 반환)
 * 초기 데이터를 받아서 캐시에 설정할 수 있음
 */
export function useDashboardOverviewData(initialData?: DashboardOverview) {
  const { data, ...rest } = useDashboardOverview();

  // 초기 데이터가 있으면 우선 사용, 없으면 API 데이터 사용
  const finalData = data?.data || initialData;

  return {
    ...rest,
    dashboardData: finalData,
    learningProgress: finalData?.learningProgress || [],
    todos: finalData?.todos || [],
    messages: finalData?.messages || [],
    aiChatExamples: finalData?.aiChatExamples || [],
    incorrectAnswerNotes: finalData?.incorrectAnswerNotes || [],
    summary: finalData?.summary,
  };
}
