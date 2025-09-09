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
import { AttemptPostResponseSchema, AttemptPostSchema, AttemptsResponseSchema } from '@/types/api';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

async function listAttemptsForUser(userId: string, problemId: string, limit: number) {
  return prisma.attempt.findMany({
    where: { userId, problemId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { id: true, selected: true, isCorrect: true, createdAt: true },
  });
}

async function createAttemptForUser(userId: string, problemId: string, selected: string) {
  return prisma.$transaction(async (tx) => {
    const problem = await tx.problem.findUnique({
      where: { id: problemId },
      select: { id: true, correctAnswer: true },
    });
    if (!problem) return { created: false, notFound: true as const };
    const isCorrect = selected.trim() === problem.correctAnswer;
    await tx.attempt.create({ data: { userId, problemId: problem.id, selected, isCorrect } });
    return { created: true, isCorrect } as const;
  });
}

async function getAttempts(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireSession();
  if (!session) throw new UnauthorizedError();
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);

  const attempts = await listAttemptsForUser(session.user.id, params.id, limit);
  AttemptsResponseSchema.parse(attempts);

  logger.info('Attempts fetched', { problemId: params.id, count: attempts.length });
  return NextResponse.json(attempts, { headers: { 'Cache-Control': 'no-store' } });
}

const postSchema = AttemptPostSchema;

async function createAttempt(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireSession();
  if (!session) throw new UnauthorizedError();
  const raw = await request.json();
  const parsed = parseJsonBody(raw, postSchema);
  if (!parsed.success) return parsed.response;

  // 레이트 리미트(간단): 1분 내 5회 제한
  const since = new Date(Date.now() - 60 * 1000);
  const recent = await prisma.attempt.count({
    where: { userId: session.user.id, problemId: params.id, createdAt: { gte: since } },
  });
  if (recent >= 5) {
    throw new AppError('요청이 너무 많습니다. 잠시 후 다시 시도하세요.', 429);
  }

  const result = await createAttemptForUser(session.user.id, params.id, parsed.data.selected);
  if (!result.created && (result as any).notFound) {
    throw new NotFoundError('문제');
  }
  logger.info('Attempt created', { problemId: params.id, isCorrect: result.isCorrect });
  const payload = { correct: result.isCorrect };
  AttemptPostResponseSchema.parse(payload);
  return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
}

export const GET = withErrorHandler(getAttempts);
export const POST = withErrorHandler(createAttempt);
