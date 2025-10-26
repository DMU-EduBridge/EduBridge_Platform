import { ApiSuccess } from '@/lib/api-response';
import {
  parseQueryParams,
  parseRequestBody,
  withAuthGET,
  withAuthPOST,
} from '@/lib/api/api-wrapper';
import { logger } from '@/lib/monitoring';
import { CreateProblemSchema, ProblemQuerySchema } from '@/lib/validation/schemas';
import { problemsService } from '@/server/services/problems/problems.service';
import { NextRequest } from 'next/server';

/**
 * 문제 목록 조회
 */
export const GET = withAuthGET(async (session, request: NextRequest) => {
  const queryResult = parseQueryParams(request, ProblemQuerySchema);
  if (!queryResult.success) {
    return queryResult.error;
  }

  // 기본값이 설정되어 있으므로 page와 limit은 항상 존재
  const queryData = queryResult.data as {
    page: number;
    limit: number;
    subject?: string;
    gradeLevel?: string;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
    type?: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY' | 'TRUE_FALSE' | 'CODING' | 'MATH';
    status?: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
    search?: string;
    createdBy?: string;
    creationType?: 'ai' | 'manual';
  };

  const result = await problemsService.getProblems(queryData);
  logger.info('문제 목록 조회 성공', { userId: session.user.id, count: result.problems.length });

  return ApiSuccess.ok(result);
});

/**
 * 문제 생성
 */
export const POST = withAuthPOST(async (session, request: NextRequest) => {
  const bodyResult = await parseRequestBody(request, CreateProblemSchema);
  if (!bodyResult.success) {
    return bodyResult.error;
  }

  // 기본값이 설정되어 있으므로 points는 항상 존재
  const problemData = bodyResult.data as {
    title: string;
    description?: string | null;
    content: string;
    type: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY' | 'TRUE_FALSE' | 'CODING' | 'MATH';
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
    subject: string;
    gradeLevel?: string | null;
    options?: any | null;
    correctAnswer: string;
    explanation?: string | null;
    hints?: any | null;
    tags?: any | null;
    points: number;
    timeLimit?: number | null;
  };

  const problem = await problemsService.createProblem(problemData, session.user.id);
  logger.info('문제 생성 성공', { userId: session.user.id, problemId: problem.id });

  return ApiSuccess.created(problem);
});
