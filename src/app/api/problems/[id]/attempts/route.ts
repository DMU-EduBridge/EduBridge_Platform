import { parseJsonBody } from '@/lib/config/validation';
import { prisma } from '@/lib/core/prisma';
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  logger,
  withErrorHandler,
} from '@/lib/utils/error-handler';
import { requireSession } from '@/server/auth/session';
import { attemptService } from '@/server/services/attempt.service';
import { AttemptPostResponseSchema, AttemptPostSchema, AttemptsResponseSchema } from '@/types/api';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// repository/service 레이어로 이동

async function getAttempts(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireSession();
  if (!session) throw new UnauthorizedError();
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);

  const attempts = await attemptService.list(session.user.id, params.id, limit);
  AttemptsResponseSchema.parse(attempts);

  logger.info('Attempts fetched', { problemId: params.id, count: attempts.length });
  return NextResponse.json(attempts, { headers: { 'Cache-Control': 'no-store' } });
}

const postSchema = AttemptPostSchema;

async function createAttempt(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireSession();
  if (!session) throw new UnauthorizedError();
  // 사용자 보정/생성(FK 위반 예방)
  let dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!dbUser) {
    const byEmail = session.user.email
      ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
      : null;
    if (byEmail) {
      dbUser = byEmail;
    } else {
      // 세션 기반 최소 사용자 생성
      dbUser = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || `${session.user.id}@local.invalid`,
          name: session.user.name || 'User',
          role: 'STUDENT',
          status: 'ACTIVE',
        },
        select: { id: true },
      });
    }
  }
  const raw = await request.json();
  const parsed = parseJsonBody(raw, postSchema);
  if (!parsed.success) return parsed.response;

  // 레이트 리미트(간단): 1분 내 5회 제한
  const limited = await attemptService.isRateLimited(session.user.id, params.id);
  if (limited) {
    throw new AppError('요청이 너무 많습니다. 잠시 후 다시 시도하세요.', 429);
  }

  const result = await attemptService.create(dbUser.id, params.id, parsed.data.selected.trim());
  if (!result.created && (result as any).notFound) {
    throw new NotFoundError('문제');
  }
  logger.info('Attempt created', { problemId: params.id, isCorrect: result.isCorrect });
  const payload = { correct: result.isCorrect };
  AttemptPostResponseSchema.parse(payload);
  return NextResponse.json(payload, {
    status: 201,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export const GET = withErrorHandler(getAttempts);
export const POST = withErrorHandler(createAttempt);
