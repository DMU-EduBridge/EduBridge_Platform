type ProblemAnswer = {
  isCorrect: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  problemTitle: string;
  completedAt: string;
};

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// React Query 키 정의
const progressKeys = {
  all: ['progress'] as const,
  study: (studyId: string) => [...progressKeys.all, 'study', studyId] as const,
};

export interface ProblemProgress {
  attemptId: string;
  selectedAnswer: string;
  startTime: string;
  lastAccessed: string;
}

export interface ProgressData {
  total: number;
  completed: number;
}

export function useProgress(studyId: string, startNewAttempt: boolean = false) {
  const queryClient = useQueryClient();
  console.log('useProgress 훅 호출:', { studyId, startNewAttempt });

  // 학습 진행 상태 조회
  const progressQuery = useQuery({
    queryKey: [...progressKeys.study(studyId), startNewAttempt],
    queryFn: async () => {
      const url = `/api/progress?studyId=${encodeURIComponent(studyId)}${startNewAttempt ? '&startNewAttempt=true' : ''}`;
      console.log('useProgress API 호출:', { studyId, startNewAttempt, url });
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('학습 진행 상태 조회 실패');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!studyId,
    // 새 시도 시작 시 서버에서 초기화가 이루어지므로, 항상 최신 값을 가져오도록 설정
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: 'always',
  });

  // 문제 완료 상태 저장
  const addCompletedProblemMutation = useMutation({
    mutationFn: async (data: { problemId: string; selectedAnswer: string; isCorrect: boolean }) => {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studyId,
          problemId: data.problemId,
          selectedAnswer: data.selectedAnswer,
          isCorrect: data.isCorrect,
        }),
      });
      if (!response.ok) {
        throw new Error('문제 완료 상태 저장 실패');
      }
      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.study(studyId) });
    },
  });

  // 문제 진행 상태 삭제 (재시도용)
  const clearProgressMutation = useMutation({
    mutationFn: async (problemId?: string) => {
      const url = problemId
        ? `/api/progress?studyId=${encodeURIComponent(studyId)}&problemId=${encodeURIComponent(problemId)}`
        : `/api/progress?studyId=${encodeURIComponent(studyId)}`;

      console.log(`진행 상태 삭제 요청: ${url}`);

      const response = await fetch(url, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('문제 진행 상태 삭제 실패');
      }
      const result = await response.json();
      console.log('진행 상태 삭제 결과:', result);
      return result;
    },
    onSuccess: () => {
      console.log('진행 상태 삭제 성공, 쿼리 무효화');
      queryClient.invalidateQueries({ queryKey: progressKeys.study(studyId) });
    },
  });

  // 진행률 계산 (최신 시도 기준)
  const progressData = useCallback((): ProgressData => {
    const data = progressQuery.data;
    if (!data) {
      return { total: 0, completed: 0 };
    }

    return {
      total: data.totalProblems,
      completed: data.completedProblems,
    };
  }, [progressQuery.data]);

  // 완료된 문제 목록 (시도한 모든 문제)
  const completedProblems = useCallback((): string[] => {
    const data = progressQuery.data;
    if (!data?.progress) return [];

    return data.progress.map((entry: any) => entry.problemId);
  }, [progressQuery.data]);

  // 문제별 답안 정보
  const problemAnswers = useCallback((): Record<string, ProblemAnswer> => {
    const answers: Record<string, ProblemAnswer> = {};
    const data = progressQuery.data;

    if (!data?.progress) return answers;

    data.progress.forEach((entry: any) => {
      answers[entry.problemId] = {
        isCorrect: entry.isCorrect,
        selectedAnswer: entry.selectedAnswer,
        correctAnswer: '', // 문제 데이터에서 가져와야 함
        problemTitle: '', // 문제 데이터에서 가져와야 함
        completedAt: entry.completedAt || new Date().toISOString(),
      };
    });

    return answers;
  }, [progressQuery.data]);

  // 학습 상태 로드
  const loadLearningStatus = useCallback(async () => {
    return progressQuery.refetch();
  }, [progressQuery]);

  // 완료된 문제 추가
  const addCompletedProblem = useCallback(
    async (data: { problemId: string; answer: ProblemAnswer }) => {
      return addCompletedProblemMutation.mutateAsync({
        problemId: data.problemId,
        selectedAnswer: data.answer.selectedAnswer,
        isCorrect: data.answer.isCorrect,
      });
    },
    [addCompletedProblemMutation],
  );

  // 진행 상태 저장 (기존 호환성 유지)
  const saveProgress = useCallback(
    async (_data: { problemId: string; selectedAnswer: string; startTime: Date }) => {
      // 학습 세션 기반에서는 별도 저장 불필요
      // 시도 추가 시 자동으로 처리됨
      return Promise.resolve();
    },
    [],
  );

  // 진행 상태 삭제 (재시도용)
  const clearProgress = useCallback(
    async (problemId?: string) => {
      return clearProgressMutation.mutateAsync(problemId);
    },
    [clearProgressMutation],
  );

  return {
    // 데이터
    progressData: progressData(),
    completedProblems: completedProblems(),
    problemAnswers: problemAnswers(),

    // 상태
    isLoading: progressQuery.isLoading,
    isError: progressQuery.isError,
    error: progressQuery.error,

    // 액션
    loadLearningStatus,
    addCompletedProblem,
    saveProgress,
    clearProgress,

    // 뮤테이션 상태
    isAddingProblem: addCompletedProblemMutation.isPending,
    isClearingProgress: clearProgressMutation.isPending,
  };
}
