/**
 * 학습 관련 유틸리티 함수들
 */

import { URL_VALUES } from '@/lib/constants/learning';
import type { NavigationParams, ProblemSubmissionData } from '@/types/learning';

/**
 * URL 파라미터에서 startNewAttempt 값을 파싱
 */
export function parseStartNewAttemptParam(
  searchParams: URLSearchParams | null,
): boolean | number | undefined {
  const startNewAttemptParam = searchParams?.get('startNewAttempt');

  if (!startNewAttemptParam) {
    return undefined;
  }

  if (startNewAttemptParam === URL_VALUES.TRUE) {
    return true;
  }

  if (startNewAttemptParam === URL_VALUES.FALSE) {
    return false;
  }

  const numericValue = Number(startNewAttemptParam);
  if (!isNaN(numericValue)) {
    return numericValue;
  }

  return undefined;
}

/**
 * URL 파라미터에서 wrongOnly 값을 파싱
 */
export function parseWrongOnlyParam(searchParams: URLSearchParams | null): boolean {
  const value = searchParams?.get('wrongOnly');
  return value === URL_VALUES.ONE || value === URL_VALUES.TRUE;
}

/**
 * URL 파라미터에서 ids 값을 파싱
 */
export function parseIdsParam(searchParams: URLSearchParams | null): string | undefined {
  const value = searchParams?.get('ids');
  return value ?? undefined;
}

/**
 * URL 파라미터에서 from 값을 파싱
 */
export function parseFromParam(searchParams: URLSearchParams | null): string | undefined {
  const value = searchParams?.get('from');
  return value ?? undefined;
}

/**
 * URL 파라미터들을 객체로 파싱
 */
export function parseNavigationParams(searchParams: URLSearchParams | null): NavigationParams {
  return {
    startNewAttempt: searchParams?.get('startNewAttempt') ?? undefined,
    wrongOnly: searchParams?.get('wrongOnly') ?? undefined,
    ids: searchParams?.get('ids') ?? undefined,
    from: searchParams?.get('from') ?? undefined,
  };
}

/**
 * URLSearchParams 객체를 생성하여 쿼리 스트링을 만듦
 */
export function buildQueryString(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * 문제 제출 데이터를 API 페이로드로 변환
 */
export function transformSubmissionToPayload(
  studyId: string,
  data: ProblemSubmissionData,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    studyId,
    problemId: data.problemId,
    selectedAnswer: data.selectedAnswer,
    isCorrect: data.isCorrect,
    attemptNumber: data.attemptNumber,
  };

  if (typeof data.startTime === 'string') {
    payload.startTime = data.startTime;
  }

  if (typeof data.timeSpent === 'number') {
    payload.timeSpent = data.timeSpent;
  }

  if (typeof data.forceNewAttempt === 'boolean') {
    payload.forceNewAttempt = data.forceNewAttempt;
  }

  return payload;
}

/**
 * 진행률을 백분율로 계산
 */
export function calculateProgressPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * 남은 문제 수 계산
 */
export function calculateRemainingProblems(completed: number, total: number): number {
  return Math.max(0, total - completed);
}

/**
 * 시도 번호가 유효한지 확인
 */
export function isValidAttemptNumber(attemptNumber: number): boolean {
  return Number.isFinite(attemptNumber) && attemptNumber > 0;
}

/**
 * 문제 ID 배열을 쉼표로 구분된 문자열로 변환
 */
export function joinProblemIds(problemIds: string[]): string {
  return problemIds.join(',');
}

/**
 * 쉼표로 구분된 문자열을 문제 ID 배열로 변환
 */
export function splitProblemIds(idsString: string): string[] {
  return idsString
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

/**
 * 단일 문제인지 확인 (wrongOnly 모드에서)
 */
export function isSingleProblemMode(wrongOnly: boolean, ids?: string): boolean {
  if (!wrongOnly || !ids) return false;

  const problemIds = splitProblemIds(ids);
  return problemIds.length === 1;
}

/**
 * 브라우저 환경에서 알림 표시
 */
export function showBrowserAlert(message: string): void {
  if (typeof window !== 'undefined') {
    try {
      window.alert(message);
    } catch (error) {
      console.warn('Failed to show alert:', error);
    }
  }
}

/**
 * 안전한 숫자 변환
 */
export function safeParseNumber(
  value: string | number | undefined,
  defaultValue: number = 0,
): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : defaultValue;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  }

  return defaultValue;
}

/**
 * 배열에서 중복 제거
 */
export function removeDuplicates<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * 배열을 시도 번호별로 정렬
 */
export function sortByAttemptNumber<T extends { attemptNumber: number }>(array: T[]): T[] {
  return [...array].sort((a, b) => a.attemptNumber - b.attemptNumber);
}

/**
 * 백분율 계산
 */
export function calculatePercentage(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * 점수 계산
 */
export function calculateScore(correct: number, total: number, totalPoints: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * totalPoints);
}

/**
 * 등급 계산
 */
export function getGrade(percentage: number): {
  grade: string;
  color: string;
  bgColor: string;
} {
  if (percentage >= 90) {
    return {
      grade: 'A+',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    };
  } else if (percentage >= 80) {
    return {
      grade: 'A',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    };
  } else if (percentage >= 70) {
    return {
      grade: 'B+',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    };
  } else if (percentage >= 60) {
    return {
      grade: 'B',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    };
  } else if (percentage >= 50) {
    return {
      grade: 'C+',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    };
  } else if (percentage >= 40) {
    return {
      grade: 'C',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    };
  } else {
    return {
      grade: 'F',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    };
  }
}
