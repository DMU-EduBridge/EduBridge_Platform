import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import {
  API_ENDPOINTS,
  DEFAULT_VALUES,
  ERROR_MESSAGES,
  PROGRESS_QUERY_KEYS,
} from '@/lib/constants/learning';
import { buildQueryString, transformSubmissionToPayload } from '@/lib/utils/learning-utils';
import type { ProblemAnswer, ProblemSubmissionData, ProgressData } from '@/types/learning';

/**
 * 학습 진행 상태를 관리하는 커스텀 훅
 * @param studyId 학습 자료 ID
 * @param startNewAttempt 새로운 시도 시작 여부 또는 시도 번호
 * @returns 진행 상태 데이터와 관련 액션들
 */
export function useProgress(studyId: string, startNewAttempt: boolean | number = false) {
  const queryClient = useQueryClient();

  // 학습 진행 상태 조회
  const progressQuery = useQuery({
    queryKey: [...PROGRESS_QUERY_KEYS.study(studyId), startNewAttempt],
    queryFn: async () => {
      const params: Record<string, string> = {
        studyId: encodeURIComponent(studyId),
      };

      if (startNewAttempt === true) {
        params.startNewAttempt = 'true';
      } else if (typeof startNewAttempt === 'number') {
        params.startNewAttempt = startNewAttempt.toString();
      }

      const queryString = buildQueryString(params);
      const url = `${API_ENDPOINTS.PROGRESS}${queryString}`;

      console.log('Fetching progress with URL:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.PROGRESS_FETCH_FAILED);
      }

      const data = await response.json();
      console.log('Progress response:', data);
      return data.data;
    },
    enabled: !!studyId,
    staleTime: DEFAULT_VALUES.STALE_TIME,
    gcTime: DEFAULT_VALUES.GC_TIME,
  });

  // 문제 완료 상태 저장
  const addCompletedProblemMutation = useMutation({
    mutationFn: async (data: ProblemSubmissionData) => {
      const payload = transformSubmissionToPayload(studyId, data);

      const response = await fetch(API_ENDPOINTS.PROGRESS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.PROGRESS_SAVE_FAILED);
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: PROGRESS_QUERY_KEYS.study(studyId) });
      queryClient.invalidateQueries({ queryKey: [...PROGRESS_QUERY_KEYS.study(studyId), true] });
      queryClient.invalidateQueries({ queryKey: [...PROGRESS_QUERY_KEYS.study(studyId), false] });
      // 오답노트 데이터도 무효화
      queryClient.invalidateQueries({ queryKey: ['incorrect-answers'] });
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
        throw new Error(ERROR_MESSAGES.PROGRESS_DELETE_FAILED);
      }
      const result = await response.json();
      console.log('진행 상태 삭제 결과:', result);
      return result;
    },
    onSuccess: () => {
      console.log('진행 상태 삭제 성공, 쿼리 무효화');
      queryClient.invalidateQueries({ queryKey: PROGRESS_QUERY_KEYS.study(studyId) });
      queryClient.invalidateQueries({ queryKey: [...PROGRESS_QUERY_KEYS.study(studyId), true] });
      queryClient.invalidateQueries({ queryKey: [...PROGRESS_QUERY_KEYS.study(studyId), false] });
      // 오답노트 데이터도 무효화
      queryClient.invalidateQueries({ queryKey: ['incorrect-answers'] });
    },
  });

  // 진행률 계산 (최신 시도 기준)
  const progressData = useCallback((): ProgressData => {
    const data = progressQuery.data;
    if (!data) {
      return { total: DEFAULT_VALUES.POINTS, completed: DEFAULT_VALUES.POINTS };
    }

    const total =
      typeof data.totalProblems === 'number' ? data.totalProblems : DEFAULT_VALUES.POINTS;
    const completed =
      typeof (data.attemptedProblems || data.completedProblems) === 'number'
        ? data.attemptedProblems || data.completedProblems
        : DEFAULT_VALUES.POINTS;

    return { total, completed };
  }, [progressQuery.data]);

  // 완료된 문제 목록 (시도한 모든 문제)
  const completedProblems = useCallback((): string[] => {
    const data = progressQuery.data;
    if (!data?.progress) return [];

    return data.progress.map((entry: any) => entry.problemId);
  }, [progressQuery.data]);

  // 정답률 정보 가져오기
  const correctnessInfo = useCallback(() => {
    const data = progressQuery.data;
    if (!data) {
      return {
        correctnessRate: DEFAULT_VALUES.POINTS,
        correctAnswers: DEFAULT_VALUES.POINTS,
        attemptedProblems: DEFAULT_VALUES.POINTS,
      };
    }

    return {
      correctnessRate: data.correctnessRate || DEFAULT_VALUES.POINTS,
      correctAnswers: data.correctAnswers || DEFAULT_VALUES.POINTS,
      attemptedProblems: data.attemptedProblems || DEFAULT_VALUES.POINTS,
    };
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
        correctAnswer: '', // TODO: 문제 데이터에서 가져와야 함
        problemTitle: '', // TODO: 문제 데이터에서 가져와야 함
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
    async (data: {
      problemId: string;
      answer: ProblemAnswer;
      attemptNumber: number;
      startTime?: string;
      timeSpent?: number;
      forceNewAttempt?: boolean;
    }) => {
      const submissionData: ProblemSubmissionData = {
        problemId: data.problemId,
        selectedAnswer: data.answer.selectedAnswer,
        isCorrect: data.answer.isCorrect,
        attemptNumber: data.attemptNumber,
        ...(typeof data.startTime === 'string' ? { startTime: data.startTime } : {}),
        ...(typeof data.timeSpent === 'number' ? { timeSpent: data.timeSpent } : {}),
        ...(typeof data.forceNewAttempt === 'boolean'
          ? { forceNewAttempt: data.forceNewAttempt }
          : {}),
      };

      return addCompletedProblemMutation.mutateAsync(submissionData);
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
    correctnessInfo: correctnessInfo(),
    activeAttemptNumber: progressQuery.data?.activeAttemptNumber ?? DEFAULT_VALUES.ATTEMPT_NUMBER,
    attemptHistory: progressQuery.data?.attemptHistory ?? [],

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
