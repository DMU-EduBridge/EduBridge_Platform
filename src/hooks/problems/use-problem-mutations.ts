import { problemsService } from '@/services/problems';
import type { Problem } from '@/types/domain/problem';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { problemKeys } from '../keys/problems';

/**
 * 문제 생성 뮤테이션 훅
 */
export function useCreateProblem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: problemsService.createProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
    },
  });
}

/**
 * 문제 수정 뮤테이션 훅
 */
export function useUpdateProblem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Problem> }) =>
      problemsService.updateProblem(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: problemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
    },
  });
}

/**
 * 문제 삭제 뮤테이션 훅
 */
export function useDeleteProblem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: problemsService.deleteProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
    },
  });
}
