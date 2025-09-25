import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// 표준 API 에러 응답 타입
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string | undefined;
  details?: any;
  timestamp: string;
  path?: string | undefined;
}

// 표준 API 성공 응답 타입
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string | undefined;
  timestamp: string;
}

// 통합 API 응답 타입
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// 에러 코드 상수 객체 (타입 안전하고 ESLint 친화적)
export const ErrorCode = {
  // 인증/권한 관련
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // 리소스 관련
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // 서버 관련
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',

  // 비즈니스 로직 관련
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  OPERATION_FAILED: 'OPERATION_FAILED',
} as const;

// 타입 정의
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// HTTP 상태 코드와 에러 코드 매핑
export const ERROR_CODE_TO_STATUS: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.RESOURCE_LOCKED]: 423,
  [ErrorCode.OPERATION_FAILED]: 422,
};

// 성공 응답 생성 헬퍼
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200,
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  if (message !== undefined) {
    response.message = message;
  }

  return NextResponse.json(response, { status });
}

// 에러 응답 생성 헬퍼
export function createErrorResponse(
  error: string,
  code?: ErrorCode,
  details?: any,
  status?: number,
  path?: string,
): NextResponse<ApiErrorResponse> {
  const httpStatus = status || (code ? ERROR_CODE_TO_STATUS[code] : 500);

  const response: ApiErrorResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
  };

  if (code !== undefined) {
    response.code = code;
  }

  if (details !== undefined) {
    response.details = details;
  }

  if (path !== undefined) {
    response.path = path;
  }

  return NextResponse.json(response, { status: httpStatus });
}

// Zod 에러를 API 에러로 변환
export function handleZodError(error: ZodError, path?: string): NextResponse<ApiErrorResponse> {
  const details = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  return createErrorResponse(
    '입력 데이터가 유효하지 않습니다.',
    ErrorCode.VALIDATION_ERROR,
    details,
    undefined,
    path,
  );
}

// 일반적인 에러들을 처리하는 헬퍼들
export const ApiError = {
  // 400 Bad Request
  badRequest: (message: string, details?: any, path?: string) =>
    createErrorResponse(message, ErrorCode.VALIDATION_ERROR, details, 400, path),

  // 401 Unauthorized
  unauthorized: (message: string = '인증이 필요합니다.', path?: string) =>
    createErrorResponse(message, ErrorCode.UNAUTHORIZED, undefined, 401, path),

  // 403 Forbidden
  forbidden: (message: string = '접근 권한이 없습니다.', path?: string) =>
    createErrorResponse(message, ErrorCode.FORBIDDEN, undefined, 403, path),

  // 404 Not Found
  notFound: (resource: string = '리소스', path?: string) =>
    createErrorResponse(
      `${resource}를 찾을 수 없습니다.`,
      ErrorCode.NOT_FOUND,
      undefined,
      404,
      path,
    ),

  // 409 Conflict
  conflict: (message: string, details?: any, path?: string) =>
    createErrorResponse(message, ErrorCode.CONFLICT, details, 409, path),

  // 422 Unprocessable Entity
  unprocessableEntity: (message: string, details?: any, path?: string) =>
    createErrorResponse(message, ErrorCode.OPERATION_FAILED, details, 422, path),

  // 429 Too Many Requests
  rateLimited: (
    message: string = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    path?: string,
  ) => createErrorResponse(message, ErrorCode.RATE_LIMITED, undefined, 429, path),

  // 500 Internal Server Error
  internalError: (message: string = '서버 내부 오류가 발생했습니다.', path?: string) =>
    createErrorResponse(message, ErrorCode.INTERNAL_ERROR, undefined, 500, path),

  // 503 Service Unavailable
  serviceUnavailable: (
    message: string = '서비스를 일시적으로 사용할 수 없습니다.',
    path?: string,
  ) => createErrorResponse(message, ErrorCode.SERVICE_UNAVAILABLE, undefined, 503, path),
};

// API 라우트에서 에러를 처리하는 래퍼 함수
export function withErrorHandling<T extends any[], R extends ApiResponse>(
  handler: (...args: T) => Promise<NextResponse<R>>,
) {
  return async (...args: T): Promise<NextResponse<ApiResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof ZodError) {
        return handleZodError(error);
      }

      if (error instanceof Error) {
        return ApiError.internalError(error.message);
      }

      return ApiError.internalError();
    }
  };
}

// 성공 응답 헬퍼들
export const ApiSuccess = {
  // 200 OK
  ok: <T>(data: T, message?: string) => createSuccessResponse(data, message, 200),

  // 201 Created
  created: <T>(data: T, message?: string) => createSuccessResponse(data, message, 201),

  // 204 No Content
  noContent: () => new NextResponse(null, { status: 204 }),
};
