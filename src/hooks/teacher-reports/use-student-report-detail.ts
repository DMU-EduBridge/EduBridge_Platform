import { TeacherReport } from '@/types/domain/teacher-report';
import { useQuery } from '@tanstack/react-query';

interface StudentReportDetailResponse {
  success: boolean;
  data: TeacherReport;
}

export function useStudentReportDetail(reportId: string) {
  return useQuery<StudentReportDetailResponse>({
    queryKey: ['student-report-detail', reportId],
    queryFn: async () => {
      const response = await fetch(`/api/my/reports/${reportId}`);
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
