import { ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { AuthenticationError, withErrorHandler } from '@/lib/errors';
import { problemService } from '@/server';
import { CreateProblemRequest, ProblemQueryParams } from '@/types/domain/problem';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

/**
 * 문제 목록 조회
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new AuthenticationError();
  }

  const { searchParams } = new URL(request.url);
  const query: ProblemQueryParams = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
    subject: searchParams.get('subject') || undefined,
    gradeLevel: searchParams.get('gradeLevel') || undefined,
    difficulty:
      (searchParams.get('difficulty') as 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT') || undefined,
    type:
      (searchParams.get('type') as
        | 'MULTIPLE_CHOICE'
        | 'SHORT_ANSWER'
        | 'ESSAY'
        | 'TRUE_FALSE'
        | 'CODING'
        | 'MATH') || undefined,
    status: (searchParams.get('status') as 'ACTIVE' | 'DRAFT' | 'ARCHIVED') || undefined,
    search: searchParams.get('search') || undefined,
    createdBy: searchParams.get('createdBy') || undefined,
  };

  const result = await problemService.getProblems(query);

  return ApiSuccess.ok(
    {
      problems: result.problems,
      pagination: result.pagination,
      total: result.total,
    },
    '문제 목록을 성공적으로 조회했습니다.',
  );
});

/**
 * 문제 생성
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new AuthenticationError();
  }

  const body = await request.json();
  const data: CreateProblemRequest = body;

  const problem = await problemService.createProblem(data, session.user.id);

  return ApiSuccess.created(problem, '문제가 성공적으로 생성되었습니다.');
});
