import { prisma } from '@/lib/core/prisma';
import { ForbiddenError, NotFoundError, logger, withErrorHandler } from '@/lib/utils/error-handler';
import { parseJsonArray } from '@/lib/utils/json';
import { requireSession } from '@/server/auth/session';
import { SolutionResponseSchema } from '@/types/api';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

async function hasUserAttemptOrPrivileged(
  userId: string,
  role: string | undefined,
  problemId: string,
) {
  if (role === 'TEACHER' || role === 'ADMIN') return true;
  const attempt = await prisma.attempt.findFirst({
    where: { userId, problemId },
    select: { id: true },
  });
  return !!attempt;
}

async function getSolution(request: NextRequest, { params }: { params: { id: string } }) {
  const problem = await prisma.problem.findUnique({
    where: { id: params.id },
    select: {
      correctAnswer: true,
      explanation: true,
      hints: true,
    },
  });

  if (!problem) {
    throw new NotFoundError('문제');
  }

  const session = await requireSession();
  const role = (session.user as any)?.role as string | undefined;
  const allowed = await hasUserAttemptOrPrivileged(session.user.id, role, params.id);
  if (!allowed) {
    throw new ForbiddenError('해설은 제출 후에만 확인할 수 있습니다.');
  }

  const hints = parseJsonArray(problem.hints);

  const payload = {
    correctAnswer: problem.correctAnswer,
    explanation: problem.explanation ?? null,
    hints,
  };
  // 응답 DTO 검증(런타임 보증)
  SolutionResponseSchema.parse(payload);
  const res = NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });

  logger.info('Problem solution fetched', { problemId: params.id });
  return res;
}

export const GET = withErrorHandler(getSolution);
