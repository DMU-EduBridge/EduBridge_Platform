import { parseJsonBody } from '@/lib/config/validation';
import { logger } from '@/lib/monitoring';
import { ValidationError, withErrorHandler } from '@/lib/utils/error-handler';
import { getPagination, getParam, getSearchParams, okJson } from '@/lib/utils/http';
import { getRequestId } from '@/lib/utils/request-context';
import { ProblemListResponseSchema } from '@/server/dto/problem';
import { problemService } from '@/server/services/problem.service';
import { CreateProblemSchema } from '@/types/api';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 60; // 목록: 짧은 캐시

// 문제 생성 스키마
const createProblemSchema = CreateProblemSchema;

// 문제 목록 조회
async function getProblems(request: NextRequest) {
  const sp = getSearchParams(request);
  const search = getParam(sp, 'search');
  const subject = getParam(sp, 'subject');
  const difficulty = getParam(sp, 'difficulty');
  const { page, limit } = getPagination(sp);

  const { items: problems, total } = await problemService.list({
    search,
    subject,
    difficulty,
    page,
    limit,
  });
  const payload = {
    problems,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
  ProblemListResponseSchema.parse(payload);
  logger.info('Problems fetched successfully', {
    count: problems.length,
    page,
    limit,
    requestId: getRequestId(request),
  });
  return okJson(payload, 'private, max-age=60', request);
}

// 새 문제 생성
async function createProblem(request: NextRequest) {
  const raw = await request.json();
  const parsed = parseJsonBody(raw, createProblemSchema);

  if (!parsed.success) {
    throw new ValidationError('잘못된 요청 데이터입니다.');
  }

  const {
    title,
    description,
    content,
    subject,
    type,
    difficulty,
    options,
    correctAnswer,
    hints,
    tags,
  } = parsed.data;

  const problem = await problemService.create({
    title,
    description,
    content,
    subject,
    type,
    difficulty,
    options,
    correctAnswer,
    hints,
    tags,
  });

  logger.info('Problem created successfully', { problemId: problem.id });

  return NextResponse.json(problem, { status: 201 });
}

export const GET = withErrorHandler(getProblems);
export const POST = withErrorHandler(createProblem);
