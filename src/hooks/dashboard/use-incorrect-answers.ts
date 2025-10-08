import type { IncorrectAnswerItem } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface IncorrectAnswerResponse {
  success: boolean;
  data: IncorrectAnswerItem[];
}

interface UpdateIncorrectAnswerRequest {
  id: string;
  problemId: string;
  isRetried?: boolean;
  isCompleted?: boolean;
}

/**
 * 오답 노트를 가져오는 훅
 */
export function useIncorrectAnswers() {
  return useQuery<IncorrectAnswerResponse>({
    queryKey: ['dashboard', 'incorrect-answers'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/incorrect-answers');

      if (!response.ok) {
        throw new Error('오답 노트를 가져오는데 실패했습니다.');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * 오답 노트 데이터를 가져오는 훅 (데이터만 반환)
 */
export function useIncorrectAnswersData() {
  const { data, ...rest } = useIncorrectAnswers();

  return {
    ...rest,
    incorrectAnswers: data?.data || [],
  };
}

/**
 * 오답 노트를 업데이트하는 훅
 */
export function useUpdateIncorrectAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: UpdateIncorrectAnswerRequest) => {
      const response = await fetch('/api/dashboard/incorrect-answers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('오답 노트 업데이트에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      // 오답 노트 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'incorrect-answers'] });
    },
  });
}
