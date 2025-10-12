import { ClassProgressSummary } from '@/types/domain/progress';
import { useQuery } from '@tanstack/react-query';

interface ClassProgressResponse {
  success: boolean;
  data: ClassProgressSummary;
}

export function useClassProgress(classId: string) {
  return useQuery<ClassProgressResponse>({
    queryKey: ['class-progress', classId],
    queryFn: async () => {
      const response = await fetch(`/api/classes/${classId}/progress`);
      if (!response.ok) {
        throw new Error('클래스 진도를 불러오는데 실패했습니다');
      }
      return response.json();
    },
    enabled: !!classId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}
