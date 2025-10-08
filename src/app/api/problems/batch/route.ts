import { logger } from '@/lib/monitoring';
import { ProblemBatchSchema } from '@/lib/validation/schemas';
import { ok, withAuth } from '@/server/http/handler';
import { problemBatchService } from '@/server/services/problems/problem-batch.service';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  return withAuth(async ({ userId, session }) => {
    // 학생은 문제 생성할 수 없음
    if (session.user.role === 'STUDENT') {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden', code: 'FORBIDDEN' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const body = await request.json();
    const data = ProblemBatchSchema.parse(body);

    const result = await problemBatchService.createProblems(userId, data);
    logger.info('문제 일괄 생성 성공', { userId, count: data.length });
    return new Response(JSON.stringify(ok(result)), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
