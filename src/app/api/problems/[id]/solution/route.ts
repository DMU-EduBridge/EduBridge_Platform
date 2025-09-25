import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import { ForbiddenError, NotFoundError, withErrorHandler } from '@/lib/utils/error-handler';
import { getRequestId } from '@/lib/utils/request-context';
import { requireSession } from '@/server/auth/session';
import { ProblemService } from '@/server/services/problem';
import { SolutionResponseSchema } from '@/types/api';
import { NextRequest, NextResponse } from 'next/server';
const problemService = new ProblemService();

// 권한 체크는 attemptService.hasAttempt로 위임

async function getSolution(request: NextRequest, { params }: { params: { id: string } }) {
  const base = await problemService.getProblemById(params.id);
  const problem = base
    ? { correctAnswer: base.correctAnswer, explanation: base.explanation, hints: base.hints }
    : null;

  if (!problem) {
    throw new NotFoundError('문제');
  }

  const session = await requireSession();
  const role = (session.user as any)?.role as string | undefined;

  // 시도 기록 확인
  const hasAttempt = await prisma.attempt.findFirst({
    where: { userId: session.user.id, problemId: params.id },
  });

  const allowed = role === 'TEACHER' || role === 'ADMIN' || hasAttempt;

  if (!allowed) {
    throw new ForbiddenError('해설은 제출 후에만 확인할 수 있습니다.');
  }

  const payload = {
    correctAnswer: problem.correctAnswer,
    explanation: problem.explanation ?? null,
    hints: problem.hints,
  };
  // 응답 DTO 검증(런타임 보증)
  SolutionResponseSchema.parse(payload);
  const res = NextResponse.json(payload, {
    headers: { 'Cache-Control': 'no-store', 'X-Request-Id': getRequestId(request) },
  });

  logger.info('Problem solution fetched', {
    problemId: params.id,
    requestId: getRequestId(request),
  });
  return res;
}

export const GET = withErrorHandler(getSolution);
