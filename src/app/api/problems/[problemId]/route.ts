import { logger } from '@/lib/monitoring';
import { UpdateProblemSchema } from '@/lib/validation/schemas';
import { ok, withAuth } from '@/server/http/handler';
import { problemDetailService } from '@/server/services/problems/problem-detail.service';
import { NextRequest } from 'next/server';

export async function GET({ params }: { params: { problemId: string } }) {
  return withAuth(async ({ userId }) => {
    const problem = await problemDetailService.getProblemById(params.problemId);

    if (!problem) {
      return new Response(
        JSON.stringify({ success: false, error: 'Problem not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    logger.info('문제 조회 성공', { userId, problemId: params.problemId });
    return new Response(JSON.stringify(ok(problem)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

export async function PUT(request: NextRequest, { params }: { params: { problemId: string } }) {
  return withAuth(async ({ userId }) => {
    const body = await request.json();
    const data = UpdateProblemSchema.parse(body);

    const result = await problemDetailService.updateProblem(params.problemId, data);
    logger.info('문제 업데이트 성공', { userId, problemId: params.problemId });
    return new Response(JSON.stringify(ok(result)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

export async function DELETE(_request: NextRequest, { params }: { params: { problemId: string } }) {
  return withAuth(async ({ userId }) => {
    const result = await problemDetailService.deleteProblem(params.problemId);
    logger.info('문제 삭제 성공', { userId, problemId: params.problemId });
    return new Response(JSON.stringify(ok(result)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
