import { ReportFilters, TeacherReport } from '@/types/domain/teacher-report';
import { useQuery } from '@tanstack/react-query';

interface StudentReportsResponse {
  success: boolean;
  data: TeacherReport[];
}

export function useStudentReports(filters: ReportFilters = {}) {
  return useQuery<StudentReportsResponse>({
    queryKey: ['student-reports', filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (filters.classId) searchParams.append('classId', filters.classId);
      if (filters.reportType) searchParams.append('reportType', filters.reportType);
      if (filters.status) searchParams.append('status', filters.status);
      if (filters.startDate) searchParams.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) searchParams.append('endDate', filters.endDate.toISOString());

      const url = `/api/my/reports${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('리포트 목록을 불러오는데 실패했습니다');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}
