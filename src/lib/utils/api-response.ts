import type { ApiResponse } from '@/lib/api-response';
import { NextRequest, NextResponse } from 'next/server';

// 표준 API 응답 타입 (통합됨)
export type StandardApiResponse<T = any> = ApiResponse<T>;

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 성공 응답 생성
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200,
): NextResponse<StandardApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}

// 페이지네이션 응답 생성
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string,
): NextResponse<PaginatedApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
    message,
    timestamp: new Date().toISOString(),
  });
}

// 에러 응답 생성
export function createErrorResponse(
  error: string,
  status: number = 500,
  details?: any,
): NextResponse<StandardApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
    },
    { status },
  );
}

// 권한 없음 응답
export function createUnauthorizedResponse(
  message: string = '권한이 없습니다.',
): NextResponse<StandardApiResponse> {
  return createErrorResponse(message, 403);
}

// 찾을 수 없음 응답
export function createNotFoundResponse(
  resource: string = '리소스',
): NextResponse<StandardApiResponse> {
  return createErrorResponse(`${resource}를 찾을 수 없습니다.`, 404);
}

// 잘못된 요청 응답
export function createBadRequestResponse(
  message: string = '잘못된 요청입니다.',
): NextResponse<StandardApiResponse> {
  return createErrorResponse(message, 400);
}

// 요청 ID 헤더 추가 유틸리티
export function addRequestId(response: NextResponse, request: NextRequest): NextResponse {
  const requestId =
    request.headers.get('x-request-id') ||
    request.headers.get('x-forwarded-for') ||
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  response.headers.set('X-Request-Id', requestId);
  return response;
}

// 보안 헤더 추가 유틸리티
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}
