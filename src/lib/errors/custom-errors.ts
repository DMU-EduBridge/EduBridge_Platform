/**
 * 커스텀 에러 클래스들
 * 표준화된 에러 처리를 위한 기본 클래스들
 */

// 기본 애플리케이션 에러 클래스
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string | undefined;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string | undefined,
    details?: any,
    isOperational: boolean = true,
  ) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    // 스택 트레이스 유지
    Error.captureStackTrace(this, this.constructor);
  }
}

// 인증 관련 에러
export class AuthenticationError extends AppError {
  constructor(message: string = '인증이 필요합니다.', details?: any) {
    super(message, 401, 'AUTHENTICATION_ERROR', details);
  }
}

// 권한 관련 에러
export class AuthorizationError extends AppError {
  constructor(message: string = '권한이 없습니다.', details?: any) {
    super(message, 403, 'AUTHORIZATION_ERROR', details);
  }
}

// 리소스 없음 에러
export class NotFoundError extends AppError {
  constructor(resource: string = '리소스', details?: any) {
    super(`${resource}을(를) 찾을 수 없습니다.`, 404, 'NOT_FOUND', details);
  }
}

// 유효성 검증 에러
export class ValidationError extends AppError {
  constructor(message: string = '입력 데이터가 유효하지 않습니다.', details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

// 충돌 에러 (중복 등)
export class ConflictError extends AppError {
  constructor(message: string = '리소스 충돌이 발생했습니다.', details?: any) {
    super(message, 409, 'CONFLICT_ERROR', details);
  }
}

// 요청 제한 에러
export class RateLimitError extends AppError {
  constructor(message: string = '요청 제한에 도달했습니다.', details?: any) {
    super(message, 429, 'RATE_LIMIT_ERROR', details);
  }
}

// 서버 내부 에러
export class InternalServerError extends AppError {
  constructor(message: string = '서버 내부 오류가 발생했습니다.', details?: any) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details);
  }
}

// 외부 서비스 에러
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string, details?: any) {
    super(
      message || `${service} 서비스와의 통신에 실패했습니다.`,
      502,
      'EXTERNAL_SERVICE_ERROR',
      details,
    );
  }
}

// 데이터베이스 에러
export class DatabaseError extends AppError {
  constructor(message: string = '데이터베이스 오류가 발생했습니다.', details?: any) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

// 파일 업로드 에러
export class FileUploadError extends AppError {
  constructor(message: string = '파일 업로드에 실패했습니다.', details?: any) {
    super(message, 400, 'FILE_UPLOAD_ERROR', details);
  }
}

// 비즈니스 로직 에러
export class BusinessLogicError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 422, 'BUSINESS_LOGIC_ERROR', details);
  }
}

// 에러 타입 가드 함수들
export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

export function isAuthenticationError(error: any): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

export function isAuthorizationError(error: any): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

export function isNotFoundError(error: any): error is NotFoundError {
  return error instanceof NotFoundError;
}

export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError;
}

export function isConflictError(error: any): error is ConflictError {
  return error instanceof ConflictError;
}

export function isRateLimitError(error: any): error is RateLimitError {
  return error instanceof RateLimitError;
}

// 에러 코드 상수
export const ERROR_CODES = {
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
