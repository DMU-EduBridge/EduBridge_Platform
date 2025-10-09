/**
 * API 응답 관련 타입 정의
 */

import type { ApiResponse } from '@/lib/api-response';
import type { Problem } from './domain/problem';
import type { LearningStatus } from './learning';

// 학습 완료 상태 API 응답
export type LearningCompleteResponse = ApiResponse<LearningStatus>;

// 진행 상태 API 응답
export type ProgressResponse = ApiResponse<{
  totalProblems: number;
  attemptedProblems: number;
  correctAnswers: number;
  correctnessRate: number;
  activeAttemptNumber: number;
  progress: Array<{
    problemId: string;
    attemptNumber: number;
    selectedAnswer: string;
    isCorrect: boolean;
    startedAt?: string;
    completedAt?: string;
    timeSpent: number;
  }>;
  attemptHistory: Array<{
    attemptNumber: number;
    attemptedProblems: number;
    correctAnswers: number;
    totalTimeSpent: number;
    isCompleted: boolean;
    correctnessRate: number;
  }>;
  latestAttemptNumber: number;
  isLatestAttemptCompleted: boolean;
}>;

// 문제 목록 API 응답
export type ProblemsResponse = ApiResponse<{
  problems: Problem[];
  totalCount: number;
  page: number;
  limit: number;
}>;

// 학습 자료 API 응답
export type LearningMaterialResponse = ApiResponse<{
  id: string;
  title: string;
  description?: string;
  subject: string;
  problems: Problem[];
}>;

// 에러 응답
export type ErrorResponse = ApiResponse<never> & {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
};

// 페이지네이션 파라미터는 common.ts에서 import
export type { PaginationParams } from './common';

// 정렬 파라미터
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 필터 파라미터
export interface FilterParams {
  subject?: string;
  difficulty?: string;
  type?: string;
  search?: string;
}
