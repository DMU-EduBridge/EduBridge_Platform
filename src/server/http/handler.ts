import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { getServerSession, Session } from 'next-auth';

export type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

export function ok<T>(data: T): ApiResult<T> {
  return { success: true, data };
}

export function fail(error: string, status = 400) {
  return new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function withAuth(
  fn: (ctx: { userId: string; session?: Session | null }) => Promise<Response>,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return fail('인증이 필요합니다.', 401);
  }
  try {
    return await fn({ userId: session.user.id, session });
  } catch (error) {
    logger.error('API 처리 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return fail('서버 오류가 발생했습니다.', 500);
  }
}
