import { TeacherReport } from '@/types/domain/teacher-report';
import { useQuery } from '@tanstack/react-query';

interface TeacherReportDetailResponse {
  success: boolean;
  data: TeacherReport;
}

export function useTeacherReportDetail(reportId: string) {
  return useQuery<TeacherReportDetailResponse>({
    queryKey: ['teacher-report-detail', reportId],
    queryFn: async () => {
      const response = await fetch(`/api/teacher-reports/${reportId}`);
      if (!response.ok) {
        throw new Error('리포트를 불러오는데 실패했습니다');
      }
      return response.json();
    },
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}
