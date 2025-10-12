import { problemsService } from '@/services/problems';
import type { AttemptPostResponse, SolutionResponse } from '@/types/api';
import type { Problem } from '@/types/domain/problem';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { problemKeys } from '../keys/problems';

/**
 * 문제 관리용 통합 훅
 * 관리 페이지에서 사용하는 모든 기능을 제공
 * @param params 검색 및 필터 파라미터
 */
export function useProblems(params?: {
  search?: string;
  subject?: string;
  difficulty?: string;
  creationType?: string;
  page?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();

  const problemsQuery = useQuery({
    queryKey: problemKeys.list(params),
    queryFn: () =>
      problemsService.getProblems(params).then((r) => {
        // 서버 응답: { success: true, data: { problems: [...], total: 118 } }
        // 우리가 필요한 것: { problems: [...], total: 118 }
        return r.data.data || { problems: [], total: 0 };
      }),
  });

  const useProblem = (id: string) =>
    useQuery({
      queryKey: problemKeys.detail(id),
      queryFn: () => problemsService.getProblem(id).then((r) => r.data),
      enabled: !!id,
    });

  const statsQuery = useQuery({
    queryKey: problemKeys.stats,
    queryFn: () =>
      problemsService.getProblemStats().then((r) => {
        // 서버 응답: { success: true, data: { ... } }
        // 우리가 필요한 것: { ... }
        return r.data.data || {};
      }),
  });

  const createMutation = useMutation({
    mutationFn: problemsService.createProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Problem> }) =>
      problemsService.updateProblem(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: problemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: problemsService.deleteProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
    },
  });

  const useSolution = (id: string, enabled: boolean) =>
    useQuery<SolutionResponse>({
      queryKey: problemKeys.solution(id),
      queryFn: () => problemsService.getProblemSolution(id).then((r) => r.data),
      enabled,
    });

  const useAttemptMutation = (id: string) =>
    useMutation<AttemptPostResponse, unknown, { selected: string }>({
      mutationKey: problemKeys.attempt(id),
      mutationFn: (payload: { selected: string }) =>
        problemsService.createProblemAttempt(id, payload).then((r) => r.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: problemKeys.solution(id) });
      },
    });

  return {
    problems: problemsQuery,
    problem: useProblem,
    stats: statsQuery,
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
    solve: useSolution,
    attempt: useAttemptMutation,
  };
}
