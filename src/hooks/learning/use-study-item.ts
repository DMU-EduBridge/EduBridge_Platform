import { learningService } from '@/services/learning';
import { useQuery } from '@tanstack/react-query';

/**
 * 특정 학습 자료를 가져오는 훅
 * @param id 학습 자료 ID
 */
export function useStudyItem(id: string) {
  return useQuery({
    queryKey: ['studyItem', id],
    queryFn: () => learningService.getStudyItem(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10분
  });
}
