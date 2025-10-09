import { authOptions } from '@/lib/core/auth';
import { ApiSuccess, ApiError } from '@/lib/api-response';
import { logger } from '@/lib/monitoring';
import { getServerSession, Session } from 'next-auth';
import { NextResponse } from 'next/server';

export type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

export function ok<T>(data: T): ApiResult<T> {
  return { success: true, data };
}

export function fail(error: string, status = 400) {
  return ApiError.badRequest(error);
}

export async function withAuth(
  fn: (ctx: { userId: string; session?: Session | null }) => Promise<NextResponse>,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return ApiError.unauthorized();
  }
  try {
    return await fn({ userId: session.user.id, session });
  } catch (error) {
    logger.error('API 처리 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return ApiError.internalError();
  }
}
