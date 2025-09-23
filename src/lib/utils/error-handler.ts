import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getErrorMessage } from '../i18n/errors';
import { getRequestId } from './request-context';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource}을(를) 찾을 수 없습니다.`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '인증이 필요합니다.') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '접근 권한이 없습니다.') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

// 에러 핸들링 유틸리티
function mapPrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2002':
      return new ConflictError(getErrorMessage('DB_UNIQUE'));
    case 'P2003':
      return new ValidationError(getErrorMessage('DB_FK'));
    case 'P2025':
      return new NotFoundError(getErrorMessage('NOT_FOUND'));
    default:
      return new AppError(getErrorMessage('DB_ERROR'), 500, false);
  }
}

export function handleApiError(error: unknown, requestId?: string) {
  // Prisma 에러 매핑
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = mapPrismaError(error);
    return handleApiError(mapped, requestId);
  }
  if (error instanceof AppError) {
    // 운영 에러인지 확인하여 로깅 레벨 결정
    const logLevel = error.isOperational ? 'warn' : 'error';
    console[logLevel](`AppError: ${error.message}`, {
      statusCode: error.statusCode,
      isOperational: error.isOperational,
    });

    const body = {
      error: error.message,
      success: false,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      requestId,
    };
    return new NextResponse(JSON.stringify(body), {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId || '' },
    });
  }

  // 예상치 못한 에러 로깅
  console.error('Unexpected error:', error);

  const body = {
    error: '서버 오류가 발생했습니다.',
    success: false,
    statusCode: 500,
    isOperational: false,
    requestId,
  };
  return new NextResponse(JSON.stringify(body), {
    status: 500,
    headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId || '' },
  });
}

// API 라우트용 에러 핸들러 래퍼
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>, // eslint-disable-line no-unused-vars
) {
  return async (...args: T): Promise<NextResponse> => {
    // eslint-disable-line no-unused-vars
    try {
      return await handler(...args);
    } catch (error) {
      // args[0]가 NextRequest인 경우 요청 ID 추출
      let requestId: string | undefined;
      try {
        const req: any = args?.[0];
        if (req && typeof req === 'object' && typeof req.headers?.get === 'function') {
          requestId = getRequestId(req);
        }
      } catch {}
      return handleApiError(error, requestId);
    }
  };
}
