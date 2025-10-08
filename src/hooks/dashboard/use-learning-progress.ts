import type { LearningProgressItem } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface LearningProgressResponse {
  success: boolean;
  data: LearningProgressItem[];
}

/**
 * 학습 진도 데이터를 가져오는 훅
 */
export function useLearningProgress() {
  return useQuery<LearningProgressResponse>({
    queryKey: ['dashboard', 'learning-progress'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/learning-progress');

      if (!response.ok) {
        throw new Error('학습 진도 데이터를 가져오는데 실패했습니다.');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * 학습 진도 데이터를 가져오는 훅 (데이터만 반환)
 */
export function useLearningProgressData() {
  const { data, ...rest } = useLearningProgress();

  return {
    ...rest,
    learningProgress: data?.data || [],
  };
}
