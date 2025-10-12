import { ReportStats } from '@/types/domain/teacher-report';
import { useQuery } from '@tanstack/react-query';

interface TeacherReportStatsResponse {
  success: boolean;
  data: ReportStats;
}

export function useTeacherReportStats() {
  return useQuery<TeacherReportStatsResponse>({
    queryKey: ['teacher-report-stats'],
    queryFn: async () => {
      const response = await fetch('/api/teacher-reports/stats');
      if (!response.ok) {
        throw new Error('리포트 통계를 불러오는데 실패했습니다');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}
