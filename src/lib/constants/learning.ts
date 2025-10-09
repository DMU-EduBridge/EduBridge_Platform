/**
 * 학습 관련 상수 정의
 */

// React Query 키
export const PROGRESS_QUERY_KEYS = {
  all: ['progress'] as const,
  study: (studyId: string) => [...PROGRESS_QUERY_KEYS.all, 'study', studyId] as const,
} as const;

// URL 파라미터 값
export const URL_PARAMS = {
  START_NEW_ATTEMPT: 'startNewAttempt',
  WRONG_ONLY: 'wrongOnly',
  IDS: 'ids',
  FROM: 'from',
  RETRY: 'retry',
} as const;

// URL 파라미터 값 상수
export const URL_VALUES = {
  TRUE: 'true',
  FALSE: 'false',
  ONE: '1',
  RESULTS: 'results',
} as const;

// 기본값
export const DEFAULT_VALUES = {
  ATTEMPT_NUMBER: 1,
  POINTS: 0,
  TIME_SPENT: 0,
  STALE_TIME: 0,
  GC_TIME: 0,
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  PROGRESS_FETCH_FAILED: '학습 진행 상태 조회 실패',
  PROGRESS_SAVE_FAILED: '문제 완료 상태 저장 실패',
  PROGRESS_DELETE_FAILED: '문제 진행 상태 삭제 실패',
  PROBLEM_NOT_FOUND: '문제를 찾을 수 없습니다',
  PROBLEM_LOAD_FAILED: '문제를 불러올 수 없습니다',
  ANSWER_REQUIRED: '답안을 선택한 후 제출해 주세요.',
} as const;

// 성공 메시지
export const SUCCESS_MESSAGES = {
  PROGRESS_SAVED: '진행 상태가 저장되었습니다',
  PROGRESS_DELETED: '진행 상태가 삭제되었습니다',
} as const;

// 페이지 경로
export const ROUTES = {
  LEARNING: '/my/learning',
  INCORRECT_ANSWERS: '/my/incorrect-answers',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
} as const;

// API 엔드포인트
export const API_ENDPOINTS = {
  PROGRESS: '/api/progress',
  LEARNING_COMPLETE: '/api/learning/complete',
} as const;
