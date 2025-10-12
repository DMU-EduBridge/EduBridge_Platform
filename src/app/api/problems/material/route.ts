import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { problemsService } from '@/server/services/problems/problems.service';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

// GET /api/problems/material?ids=a,b,c
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids') || '';
    const ids = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ids 파라미터가 필요합니다.',
          code: 'BAD_REQUEST',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const data = await problemsService.getProblemMaterialMappings(ids);
    logger.info('문제-학습자료 매핑 조회 성공', { userId: session.user.id, count: data.length });
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error('문제-학습자료 매핑 조회 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return new Response(JSON.stringify({ success: false, error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
