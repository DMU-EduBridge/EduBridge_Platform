import { useQuery } from '@tanstack/react-query';

export interface StudentReportResponse {
  studentId: string;
  summaryInsights: string[];
  metrics: {
    byWeek: Array<{ week: string; score: number }>;
    byDifficulty: Array<{ level: 'EASY' | 'MEDIUM' | 'HARD'; accuracy: number }>;
    byType: Array<{ type: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER'; accuracy: number }>;
  };
  weakConcepts: string[];
  topItems: Array<{ id: string; title: string }>;
  recommendations: string[];
  citations: Array<{ id: string; title: string }>;
}

export function useStudentReport(studentId?: string) {
  const enabled = Boolean(studentId);
  const queryKey = ['student-report', studentId];
  const query = useQuery({
    queryKey,
    enabled,
    queryFn: async (): Promise<StudentReportResponse> => {
      const res = await fetch(`/api/teacher-reports/students/${studentId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch student report');
      const json = await res.json();
      return json.data as StudentReportResponse;
    },
  });

  return query;
}
