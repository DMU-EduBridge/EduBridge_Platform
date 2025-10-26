import { ApiError } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * API 라우트를 위한 공통 래퍼 함수들
 */

// 인증 체크 결과 타입
interface AuthResult {
  session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>;
  isAuthenticated: true;
}

interface UnauthenticatedResult {
  session: null;
  isAuthenticated: false;
}

type AuthCheckResult = AuthResult | UnauthenticatedResult;

// 세션 타입 정의
type SessionType = NonNullable<Awaited<ReturnType<typeof getServerSession>>> & {
  user: {
    id: string;
    role: string;
  };
};

/**
 * 세션 인증 체크
 */
export async function checkAuth(): Promise<AuthCheckResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { session: null, isAuthenticated: false };
  }

  return { session, isAuthenticated: true };
}

/**
 * 권한 체크 (역할 기반)
 */
export function checkRole(session: SessionType, allowedRoles: string[]): boolean {
  if (!session?.user?.role) return false;
  return allowedRoles.includes(session.user.role);
}

/**
 * API 핸들러를 위한 공통 래퍼
 */
export function withAuth<T extends any[]>(
  handler: (session: SessionType, ...args: T) => Promise<NextResponse>,
  options?: {
    allowedRoles?: string[];
    requireAuth?: boolean;
  },
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      const authResult = await checkAuth();

      if (!authResult.isAuthenticated) {
        if (options?.requireAuth !== false) {
          return ApiError.unauthorized();
        }
        // 인증이 선택적인 경우 빈 세션 객체를 전달
        return handler({ user: { id: '', role: 'STUDENT' } } as any, ...args);
      }

      // 역할 체크
      if (
        options?.allowedRoles &&
        !checkRole(authResult.session as SessionType, options.allowedRoles)
      ) {
        return ApiError.forbidden('접근 권한이 없습니다.');
      }

      return handler(authResult.session as SessionType, ...args);
    } catch (error) {
      console.error('API Handler Error:', error);

      if (error instanceof z.ZodError) {
        return ApiError.badRequest('입력 데이터가 올바르지 않습니다.', error.errors);
      }

      if (error instanceof Error) {
        return ApiError.internalError(error.message);
      }

      return ApiError.internalError();
    }
  };
}

/**
 * GET 요청을 위한 공통 래퍼
 */
export function withAuthGET<T extends any[]>(
  handler: (session: SessionType, ...args: T) => Promise<NextResponse>,
  options?: {
    allowedRoles?: string[];
    requireAuth?: boolean;
  },
) {
  return withAuth(handler, options);
}

/**
 * POST 요청을 위한 공통 래퍼
 */
export function withAuthPOST<T extends any[]>(
  handler: (session: SessionType, ...args: T) => Promise<NextResponse>,
  options?: {
    allowedRoles?: string[];
    requireAuth?: boolean;
  },
) {
  return withAuth(handler, options);
}

/**
 * PUT/PATCH 요청을 위한 공통 래퍼
 */
export function withAuthPUT<T extends any[]>(
  handler: (session: SessionType, ...args: T) => Promise<NextResponse>,
  options?: {
    allowedRoles?: string[];
    requireAuth?: boolean;
  },
) {
  return withAuth(handler, options);
}

/**
 * DELETE 요청을 위한 공통 래퍼
 */
export function withAuthDELETE<T extends any[]>(
  handler: (session: SessionType, ...args: T) => Promise<NextResponse>,
  options?: {
    allowedRoles?: string[];
    requireAuth?: boolean;
  },
) {
  return withAuth(handler, options);
}

/**
 * 쿼리 파라미터 파싱을 위한 헬퍼
 */
export function parseQueryParams<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
): { success: true; data: T } | { success: false; error: NextResponse } {
  try {
    const { searchParams } = new URL(request.url);
    const params: Record<string, string | undefined> = {};

    // 모든 쿼리 파라미터를 객체로 변환
    searchParams.forEach((value, key) => {
      params[key] = value || undefined;
    });

    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: ApiError.badRequest('쿼리 파라미터가 올바르지 않습니다.', error.errors),
      };
    }
    return {
      success: false,
      error: ApiError.internalError('쿼리 파라미터 파싱 중 오류가 발생했습니다.'),
    };
  }
}

/**
 * 요청 본문 파싱을 위한 헬퍼
 */
export async function parseRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: ApiError.badRequest('요청 본문이 올바르지 않습니다.', error.errors),
      };
    }
    return {
      success: false,
      error: ApiError.internalError('요청 본문 파싱 중 오류가 발생했습니다.'),
    };
  }
}
