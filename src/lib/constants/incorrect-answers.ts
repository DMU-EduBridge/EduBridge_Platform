/**
 * 오답노트 관련 상수 정의
 */

export const INCORRECT_ANSWERS_CONFIG = {
  DEFAULT_SUBJECT: '기타',
  DEFAULT_DIFFICULTY: 'MEDIUM',
  DEFAULT_ATTEMPT_NUMBER: 1,
  QUESTION_PREVIEW_LENGTH: 80,
  DEFAULT_GRADE_COLOR: 'red' as const,
  DEFAULT_STATUS_COLOR: 'red' as const,
  DEFAULT_STATUS: '복습 필요',
} as const;

export const GRADE_COLORS = {
  red: 'red',
  yellow: 'yellow',
  green: 'green',
} as const;

export const STATUS_COLORS = {
  red: 'red',
  yellow: 'yellow',
  green: 'green',
} as const;
