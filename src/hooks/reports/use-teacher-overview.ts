import { useQuery } from '@tanstack/react-query';

export interface TeacherOverviewResponse {
  classSummary: {
    avgScore: number;
    bottom10pctAvg: number;
    flaggedCount: number;
    topWeakConcepts: string[];
  };
  students: Array<{
    studentId: string;
    name: string;
    mastery: number;
    scoreDelta: number;
    flagged: boolean;
    flags: string[];
    risk?: { score: number; level: 'LOW' | 'MEDIUM' | 'HIGH'; reasons: string[] };
    lastUpdated: string;
    reportId: string;
  }>;
}

export function useTeacherOverview(params?: {
  classId?: string;
  from?: string;
  to?: string;
  subjectIds?: string[];
  studentIds?: string[];
  flaggedOnly?: boolean;
}) {
  const search = new URLSearchParams();
  if (params?.classId) search.set('classId', params.classId);
  if (params?.from) search.set('from', params.from);
  if (params?.to) search.set('to', params.to);
  if (params?.subjectIds?.length) search.set('subjectIds', params.subjectIds.join(','));
  if (params?.studentIds?.length) search.set('studentIds', params.studentIds.join(','));
  if (params?.flaggedOnly) search.set('flaggedOnly', '1');

  const queryKey = ['teacher-overview', params];
  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<TeacherOverviewResponse> => {
      const res = await fetch(
        `/api/teacher-reports/overview${search.toString() ? `?${search.toString()}` : ''}`,
        {
          cache: 'no-store',
        },
      );
      if (!res.ok) throw new Error('Failed to fetch overview');
      const json = await res.json();
      return json.data as TeacherOverviewResponse;
    },
  });

  return query;
}
