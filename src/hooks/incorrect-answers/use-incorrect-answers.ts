/**
 * 오답노트 데이터를 관리하는 커스텀 훅
 */

import type { IncorrectAnswersData } from '@/types/incorrect-answers';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const INCORRECT_ANSWERS_QUERY_KEY = ['incorrect-answers'] as const;

/**
 * 오답노트 데이터를 가져오는 함수
 */
async function fetchIncorrectAnswers(): Promise<IncorrectAnswersData> {
  const response = await fetch('/api/incorrect-answers');

  if (!response.ok) {
    throw new Error('오답노트 데이터를 불러올 수 없습니다.');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || '오답노트 데이터를 불러올 수 없습니다.');
  }

  return result.data;
}

/**
 * 오답노트 데이터를 관리하는 커스텀 훅
 */
export function useIncorrectAnswers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: INCORRECT_ANSWERS_QUERY_KEY,
    queryFn: fetchIncorrectAnswers,
    staleTime: 0, // 항상 최신 데이터 가져오기
    gcTime: 0, // 캐시 비활성화
  });

  /**
   * 오답노트 데이터를 무효화하여 새로고침
   */
  const invalidateIncorrectAnswers = () => {
    queryClient.invalidateQueries({ queryKey: INCORRECT_ANSWERS_QUERY_KEY });
  };

  /**
   * 오답노트 데이터를 즉시 새로고침
   */
  const refetchIncorrectAnswers = () => {
    return query.refetch();
  };

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    invalidateIncorrectAnswers,
    refetchIncorrectAnswers,
  };
}
