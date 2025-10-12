import { ClassWithStats } from '@/types/domain/class';
import { useQuery } from '@tanstack/react-query';

interface ClassDetailResponse {
  success: boolean;
  data: ClassWithStats;
}

export function useClassDetail(classId: string) {
  return useQuery<ClassDetailResponse>({
    queryKey: ['class', classId],
    queryFn: async () => {
      const response = await fetch(`/api/classes/${classId}`);
      if (!response.ok) {
        throw new Error('클래스 정보를 불러오는데 실패했습니다');
      }
      return response.json();
    },
    enabled: !!classId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}
