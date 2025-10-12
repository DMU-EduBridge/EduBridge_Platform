import { logger } from '@/lib/monitoring';
import { UpdateProblemSchema } from '@/lib/validation/schemas';
import { ok, withAuth } from '@/server/http/handler';
import { problemService } from '@/server/services/problem/problem-crud.service';
import type { UpdateProblemRequest } from '@/types/domain/problem';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { problemId: string } }) {
  const authHandler = await withAuth(async ({ userId }) => {
    const problem = await problemService.getProblemById(params.problemId);

    if (!problem) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Problem not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    logger.info('문제 조회 성공', { userId, problemId: params.problemId });
    return new NextResponse(JSON.stringify(ok(problem)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });

  return authHandler(request);
}

export async function PUT(request: NextRequest, { params }: { params: { problemId: string } }) {
  const authHandler = await withAuth(async ({ userId }) => {
    const body = await request.json();
    const data = UpdateProblemSchema.parse(body);

    const result = await problemService.updateProblem(
      params.problemId,
      data as UpdateProblemRequest,
    );
    logger.info('문제 업데이트 성공', { userId, problemId: params.problemId });
    return new NextResponse(JSON.stringify(ok(result)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });

  return authHandler(request);
}

export async function DELETE(request: NextRequest, { params }: { params: { problemId: string } }) {
  const authHandler = await withAuth(async ({ userId }) => {
    const result = await problemService.deleteProblem(params.problemId);
    logger.info('문제 삭제 성공', { userId, problemId: params.problemId });
    return new NextResponse(JSON.stringify(ok(result)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });

  return authHandler(request);
}
