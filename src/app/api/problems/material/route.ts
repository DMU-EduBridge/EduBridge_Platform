import { logger } from '@/lib/monitoring';
import { ok, withAuth } from '@/server/http/handler';
import { problemsService } from '@/server/services/problems/problems.service';
import { NextRequest } from 'next/server';

// GET /api/problems/material?ids=a,b,c
export async function GET(request: NextRequest) {
  return withAuth(async ({ userId }) => {
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
    logger.info('문제-학습자료 매핑 조회 성공', { userId, count: data.length });
    return new Response(JSON.stringify(ok(data)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
