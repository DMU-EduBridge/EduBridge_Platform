import { logger } from '@/lib/monitoring';
import { ProblemGenerationSchema } from '@/lib/validation/schemas';
import { ok, withAuth } from '@/server/http/handler';
import { problemGenerationService } from '@/server/services/problems/problem-generation.service';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  return withAuth(async ({ userId, session }) => {
    // 학생은 문제 생성할 수 없음
    if (session?.user.role === 'STUDENT') {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden', code: 'FORBIDDEN' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const body = await request.json();
    const data = ProblemGenerationSchema.parse(body);

    const result = await problemGenerationService.generateProblems(userId, data);
    logger.info('문제 생성 성공', { userId, count: data.count, subject: data.subject });
    return new Response(JSON.stringify(ok(result)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
