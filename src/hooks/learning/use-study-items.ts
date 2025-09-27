import { learningService } from '@/services/learning';
import { useQuery } from '@tanstack/react-query';

/**
 * 학습 자료 목록을 가져오는 훅
 * StudyItem 타입으로 변환된 데이터를 반환
 */
export function useStudyItems() {
  return useQuery({
    queryKey: ['studyItems'],
    queryFn: async () => {
      const response = await learningService.getStudyItems();
      // API 응답 구조: { success: true, data: { items: [...] } }
      return response.data.data?.items || [];
    },
    staleTime: 5 * 60 * 1000, // 5분
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
