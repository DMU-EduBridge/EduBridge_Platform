import { NextResponse } from 'next/server';

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
export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    // 운영 에러인지 확인하여 로깅 레벨 결정
    const logLevel = error.isOperational ? 'warn' : 'error';
    console[logLevel](`AppError: ${error.message}`, {
      statusCode: error.statusCode,
      isOperational: error.isOperational,
    });

    return NextResponse.json(
      {
        error: error.message,
        success: false,
        statusCode: error.statusCode,
        isOperational: error.isOperational,
      },
      { status: error.statusCode },
    );
  }

  // 예상치 못한 에러 로깅
  console.error('Unexpected error:', error);

  return NextResponse.json(
    {
      error: '서버 오류가 발생했습니다.',
      success: false,
      statusCode: 500,
      isOperational: false,
    },
    { status: 500 },
  );
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
      return handleApiError(error);
    }
  };
}

// 로깅 유틸리티
export const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message: string, meta?: Record<string, any>) => {
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, error?: Error, meta?: Record<string, any>) => {
    console.error(`[ERROR] ${message}`, {
      error: error?.message,
      stack: error?.stack,
      meta: meta ? JSON.stringify(meta) : undefined,
    });
  },
  debug: (message: string, meta?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta) : '');
    }
  },
};
