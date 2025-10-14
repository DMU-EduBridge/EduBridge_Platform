import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { ROUTES, URL_VALUES } from '@/lib/constants/learning';
import {
  buildQueryString,
  isSingleProblemMode,
  parseFromParam,
  parseIdsParam,
  parseWrongOnlyParam,
} from '@/lib/utils/learning-utils';
import type { ProblemNavigationProps } from '@/types/learning';

/**
 * 문제 네비게이션을 관리하는 커스텀 훅
 * @param props 네비게이션 설정
 * @returns 네비게이션 관련 함수들과 파라미터들
 */
export function useProblemNavigation({ studyId, nextProblem }: ProblemNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터들 파싱
  const startNewAttemptParam = useMemo(() => {
    const value = searchParams?.get('startNewAttempt');
    return value !== null && value !== '';
  }, [searchParams]);

  const wrongOnlyParam = useMemo(() => parseWrongOnlyParam(searchParams), [searchParams]);
  const idsParam = useMemo(() => parseIdsParam(searchParams), [searchParams]);
  const fromParam = useMemo(() => parseFromParam(searchParams), [searchParams]);

  const handleNext = useCallback(() => {
    const params: Record<string, string> = {};

    // startNewAttempt 파라미터 유지
    if (startNewAttemptParam) {
      const startNewAttemptValue = searchParams?.get('startNewAttempt');
      if (startNewAttemptValue) {
        params.startNewAttempt = startNewAttemptValue;
      }
    }

    // wrongOnly 파라미터 유지
    if (wrongOnlyParam) {
      params.wrongOnly = URL_VALUES.ONE;
    }

    // ids 파라미터 유지
    if (idsParam) {
      params.ids = idsParam;
    }

    const queryString = buildQueryString(params);

    // 다음 문제가 있으면 다음 문제로 이동
    if (nextProblem) {
      router.push(`/my/learning/${studyId}/problems/${nextProblem.id}${queryString}`);
      return;
    }

    // 마지막 문제인 경우: 단일 문제 모드면 출발지에 따라 복귀
    if (isSingleProblemMode(wrongOnlyParam, idsParam)) {
      if (fromParam === URL_VALUES.RESULTS) {
        router.push(`/my/learning/${studyId}/results${queryString}`);
      } else {
        router.push(ROUTES.INCORRECT_ANSWERS);
      }
    } else {
      router.push(`/my/learning/${studyId}/results${queryString}`);
    }
  }, [
    nextProblem,
    studyId,
    router,
    startNewAttemptParam,
    wrongOnlyParam,
    idsParam,
    fromParam,
    searchParams,
  ]);

  const handleBackToLearning = useCallback(() => {
    router.push(ROUTES.LEARNING);
  }, [router]);

  return {
    startNewAttemptParam,
    wrongOnlyParam,
    idsParam,
    fromParam,
    handleNext,
    handleBackToLearning,
  };
}
