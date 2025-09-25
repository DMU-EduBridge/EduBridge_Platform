import { parseJsonBody } from '@/lib/config/validation';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  withErrorHandler,
} from '@/lib/utils/error-handler';
import { requireSession } from '@/server/auth/session';
import { AttemptPostResponseSchema, AttemptPostSchema, AttemptsResponseSchema } from '@/types/api';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// repository/service 레이어로 이동

async function getAttempts(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireSession();
  if (!session) throw new UnauthorizedError();
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);

  const attempts = await prisma.attempt.findMany({
    where: { userId: session.user.id, problemId: params.id },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
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

  // 레이트 리미트 체크 (간단한 구현)
  const recentAttempts = await prisma.attempt.count({
    where: {
      userId: session.user.id,
      problemId: params.id,
      createdAt: {
        gte: new Date(Date.now() - 60000), // 1분 전
      },
    },
  });

  if (recentAttempts >= 5) {
    throw new AppError('요청이 너무 많습니다. 잠시 후 다시 시도하세요.', 429);
  }

  // 문제 존재 확인
  const problem = await prisma.problem.findUnique({
    where: { id: params.id },
    select: { correctAnswer: true },
  });

  if (!problem) {
    throw new NotFoundError('문제');
  }

  const isCorrect = parsed.data.selected.trim() === problem.correctAnswer;

  const attempt = await prisma.attempt.create({
    data: {
      userId: dbUser.id,
      problemId: params.id,
      selectedAnswer: parsed.data.selected.trim(),
      isCorrect,
      timeSpent: parsed.data.timeSpent || 0,
      hintsUsed: parsed.data.hintsUsed || 0,
      attemptsCount: recentAttempts + 1,
    },
  });

  const result = { created: true, isCorrect };
  logger.info('Attempt created', { problemId: params.id, isCorrect: result.isCorrect });
  const payload = { correct: result.isCorrect };
  AttemptPostResponseSchema.parse(payload);

  // 보안 헤더 추가
  const response = NextResponse.json(payload, {
    status: 201,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  });

  return response;
}

export const GET = withErrorHandler(getAttempts);
export const POST = withErrorHandler(createAttempt);
