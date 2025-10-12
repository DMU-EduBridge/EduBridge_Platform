import { ClassWithStats } from '@/types/domain/class';
import { useQuery } from '@tanstack/react-query';

interface ClassesResponse {
  success: boolean;
  data: ClassWithStats[];
}

export function useClasses() {
  return useQuery<ClassesResponse>({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await fetch('/api/classes');
      if (!response.ok) {
        throw new Error('클래스 목록을 불러오는데 실패했습니다');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}
