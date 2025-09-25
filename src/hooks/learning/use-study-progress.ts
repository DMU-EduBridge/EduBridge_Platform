import { learningService } from '@/services/learning';
import { useQuery } from '@tanstack/react-query';

/**
 * 학습 진행 상황을 가져오는 훅
 * @param studyId 학습 자료 ID
 */
export function useStudyProgress(studyId: string) {
  return useQuery({
    queryKey: ['studyProgress', studyId],
    queryFn: () => learningService.getStudyProgress(studyId).then((r) => r.data),
    enabled: !!studyId,
    staleTime: 2 * 60 * 1000, // 2분
  });
}
