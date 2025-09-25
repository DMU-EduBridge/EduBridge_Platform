import { problemsService } from '@/services/problems';
import {
  convertLLMProblemToInternal,
  LLMProblemGenerationRequest,
  LLMProblemGenerationResponse,
  Problem,
} from '@/types/domain/problem';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { problemKeys } from '../keys/problems';

/**
 * LLM 문제 생성 훅
 */
export function useGenerateProblems() {
  return useMutation({
    mutationFn: (request: LLMProblemGenerationRequest) => problemsService.generateProblems(request),
    onSuccess: () => {
      // 문제 목록 새로고침
      const queryClient = useQueryClient();
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
    },
  });
}

/**
 * LLM 문제 생성 및 저장 훅
 */
export function useGenerateAndSaveProblems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LLMProblemGenerationRequest) =>
      problemsService.generateAndSaveProblems(request),
    onSuccess: () => {
      // 문제 목록 새로고침
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
    },
  });
}

/**
 * 문제 일괄 생성 훅
 */
export function useCreateProblems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (problems: Omit<Problem, 'id' | 'createdAt' | 'attempts' | 'successRate'>[]) =>
      problemsService.createProblems(problems),
    onSuccess: () => {
      // 문제 목록 새로고침
      queryClient.invalidateQueries({ queryKey: problemKeys.all });
    },
  });
}

/**
 * LLM 문제를 내부 형식으로 변환하여 저장하는 훅
 */
export function useSaveLLMProblems() {
  const createProblemsMutation = useCreateProblems();

  const saveLLMProblems = (llmProblems: LLMProblemGenerationResponse) => {
    const internalProblems = llmProblems.questions.map(convertLLMProblemToInternal);
    return createProblemsMutation.mutateAsync(internalProblems as any);
  };

  return {
    saveLLMProblems,
    isLoading: createProblemsMutation.isPending,
    error: createProblemsMutation.error,
  };
}
