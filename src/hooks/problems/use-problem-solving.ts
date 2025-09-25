import { problemsService } from '@/services/problems';
import type { AttemptPostResponse, SolutionResponse } from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { problemKeys } from '../keys/problems';

/**
 * 문제 해답을 가져오는 훅
 * @param id 문제 ID
 * @param enabled 쿼리 활성화 여부
 */
export function useProblemSolution(id: string, enabled: boolean) {
  return useQuery<SolutionResponse>({
    queryKey: problemKeys.solution(id),
    queryFn: () => problemsService.getProblemSolution(id).then((r) => r.data),
    enabled,
  });
}

/**
 * 문제 시도 뮤테이션 훅
 * @param id 문제 ID
 */
export function useProblemAttempt(id: string) {
  const queryClient = useQueryClient();

  return useMutation<AttemptPostResponse, unknown, { selected: string }>({
    mutationKey: problemKeys.attempt(id),
    mutationFn: (payload: { selected: string }) =>
      problemsService.createProblemAttempt(id, payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: problemKeys.solution(id) });
    },
  });
}
