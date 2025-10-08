import { reportsService } from '@/services/reports';
import { useQuery } from '@tanstack/react-query';

/**
 * 리포트 상세의 섹션 데이터를 한 번에 제공하는 훅
 * 단일 상세 API(/reports/:id/detail)에서 받아 분해합니다.
 */
export function useReportDetailSections(id: string) {
  const query = useQuery({
    queryKey: ['reports', 'detail', id],
    queryFn: async () => {
      const res = await reportsService.getReportDetail(id);
      return res.data?.data ?? res.data; // 서비스 응답 래핑 호환
    },
    enabled: !!id,
    staleTime: 60_000,
  });

  return {
    isLoading: query.isLoading,
    isError: !!query.error,
    breakdown: (query.data as any)?.breakdown ?? [],
    concepts: (query.data as any)?.concepts ?? [],
    timeline: (query.data as any)?.timeline ?? [],
    recentMistakes: (query.data as any)?.recentMistakes ?? [],
  };
}
