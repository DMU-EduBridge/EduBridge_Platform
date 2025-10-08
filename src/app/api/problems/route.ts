import { logger } from '@/lib/monitoring';
import { CreateProblemSchema, ProblemQuerySchema } from '@/lib/validation/schemas';
import { ok, withAuth } from '@/server/http/handler';
import { problemsService } from '@/server/services/problems/problems.service';
import { NextRequest } from 'next/server';

/**
 * 문제 목록 조회
 */
export async function GET(request: NextRequest) {
  return withAuth(async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const query = ProblemQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      subject: searchParams.get('subject'),
      gradeLevel: searchParams.get('gradeLevel'),
      difficulty: searchParams.get('difficulty'),
      type: searchParams.get('type'),
      status: searchParams.get('status'),
      search: searchParams.get('search'),
      createdBy: searchParams.get('createdBy'),
    });

    const result = await problemsService.getProblems(query);
    logger.info('문제 목록 조회 성공', { userId, count: result.problems.length });
    return new Response(JSON.stringify(ok(result)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

/**
 * 문제 생성
 */
export async function POST(request: NextRequest) {
  return withAuth(async ({ userId }) => {
    const body = await request.json();
    const data = CreateProblemSchema.parse(body);

    const problem = await problemsService.createProblem(data, userId);
    logger.info('문제 생성 성공', { userId, problemId: problem.id });
    return new Response(JSON.stringify(ok(problem)), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
