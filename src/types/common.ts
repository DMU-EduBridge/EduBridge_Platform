// 공통 타입 정의
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchParams {
  search?: string;
  subject?: string;
  difficulty?: string;
  status?: string;
  type?: string;
}

// API 응답 타입들 (통합됨)
import type { ApiSuccessResponse } from '@/lib/api-response';

export type PaginatedResponse<T = any> = ApiSuccessResponse<T[]> & {
  pagination: PaginationResult;
};
