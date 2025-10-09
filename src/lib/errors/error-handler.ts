import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../monitoring';
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  isAppError,
} from './custom-errors';

/**
 * 에러 응답 생성
 */
export function createErrorResponse(error: Error, request?: NextRequest): NextResponse {
  const timestamp = new Date().toISOString();
  const path = request?.url ? new URL(request.url).pathname : undefined;

  // AppError인 경우 상세 정보 포함
  if (isAppError(error)) {
    const errorResponse = {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp,
      path,
    };

    logger.error(`API Error: ${error.message}`, undefined, {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      path,
    });

    return NextResponse.json(errorResponse, { status: error.statusCode });
  }

  // 일반 Error인 경우 기본 처리
  const errorResponse = {
    success: false,
    error: '서버 내부 오류가 발생했습니다.',
    code: 'INTERNAL_SERVER_ERROR',
    timestamp,
    path,
  };

  logger.error('Unexpected error', undefined, {
    error: error.message,
    stack: error.stack,
    path,
  });

  return NextResponse.json(errorResponse, { status: 500 });
}

/**
 * 에러 핸들링 래퍼 함수
 */
export function withErrorHandler<T extends any[]>(handler: (...args: T) => Promise<NextResponse>) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return createErrorResponse(error as Error, args[0] as NextRequest);
    }
  };
}

/**
 * Prisma 에러를 커스텀 에러로 변환
 */
export function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target?.[0] || '필드';
      return new ConflictError(`${field}이(가) 이미 존재합니다.`);
    
    case 'P2025':
      // Record not found
      return new NotFoundError('레코드');
    
    case 'P2003':
      // Foreign key constraint violation
      return new ValidationError('관련 데이터가 존재하지 않습니다.');
    
    case 'P2014':
      // Required relation violation
      return new ValidationError('필수 관계 데이터가 누락되었습니다.');
    
    case 'P2015':
      // Record to delete not found
      return new NotFoundError('삭제할 레코드');
    
    case 'P2016':
      // Query interpretation error
      return new DatabaseError('쿼리 해석 오류가 발생했습니다.');
    
    case 'P2017':
      // Records for relation not connected
      return new ValidationError('관계 연결이 끊어진 레코드가 있습니다.');
    
    case 'P2018':
      // Required connected records not found
      return new ValidationError('필수 연결 레코드를 찾을 수 없습니다.');
    
    case 'P2019':
      // Input error
      return new ValidationError('입력 데이터 오류가 발생했습니다.');
    
    case 'P2020':
      // Value out of range for the type
      return new ValidationError('값이 허용 범위를 벗어났습니다.');
    
    case 'P2021':
      // Table does not exist
      return new DatabaseError('테이블이 존재하지 않습니다.');
    
    case 'P2022':
      // Column does not exist
      return new DatabaseError('컬럼이 존재하지 않습니다.');
    
    case 'P2023':
      // Inconsistent column data
      return new DatabaseError('컬럼 데이터가 일관되지 않습니다.');
    
    case 'P2024':
      // Transaction failed due to a write conflict
      return new DatabaseError('트랜잭션 충돌로 인해 실패했습니다.');
    
    default:
      // 기타 Prisma 에러
      return new DatabaseError(`데이터베이스 오류: ${error.message}`);
  }
}

/**
 * Zod 검증 에러를 커스텀 에러로 변환
 */
export function handleZodError(error: any): ValidationError {
  const details = error.errors?.map((err: any) => ({
    field: err.path?.join('.') || 'unknown',
    message: err.message,
    code: err.code,
  }));

  return new ValidationError('입력 데이터 검증에 실패했습니다.', details);
}

/**
 * 인증 에러 생성 헬퍼
 */
export function createAuthError(message?: string): AuthenticationError {
  return new AuthenticationError(message);
}

/**
 * 권한 에러 생성 헬퍼
 */
export function createAuthzError(message?: string): AuthorizationError {
  return new AuthorizationError(message);
}

/**
 * 리소스 없음 에러 생성 헬퍼
 */
export function createNotFoundError(resource?: string): NotFoundError {
  return new NotFoundError(resource);
}

/**
 * 유효성 검증 에러 생성 헬퍼
 */
export function createValidationError(message?: string, details?: any): ValidationError {
  return new ValidationError(message, details);
}

/**
 * 충돌 에러 생성 헬퍼
 */
export function createConflictError(message?: string): ConflictError {
  return new ConflictError(message);
}

/**
 * 레이트 리미트 에러 생성 헬퍼
 */
export function createRateLimitError(message?: string): RateLimitError {
  return new RateLimitError(message);
}

/**
 * 외부 서비스 에러 생성 헬퍼
 */
export function createExternalServiceError(
  service: string,
  message?: string,
): ExternalServiceError {
  return new ExternalServiceError(service, message);
}

/**
 * 비즈니스 로직 에러 생성 헬퍼
 */
export function createBusinessLogicError(message: string, details?: any): AppError {
  return new AppError(message, 422, 'BUSINESS_LOGIC_ERROR', details);
}

/**
 * 에러 로깅 헬퍼
 */
export function logError(error: Error, context?: any): void {
  if (isAppError(error)) {
    logger.error(`Application Error: ${error.message}`, undefined, {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      context,
    });
  } else {
    logger.error('Unexpected Error', undefined, {
      error: error.message,
      stack: error.stack,
      context,
    });
  }
}
