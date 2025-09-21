import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { problemService } from '@/server';
import {
  CreateProblemDto,
  ProblemListQueryDto,
  ProblemListResponseSchema,
  ProblemResponseDto,
} from '@/server/dto/problem';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 문제 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      subject: searchParams.get('subject') || undefined,
      gradeLevel: searchParams.get('gradeLevel') || undefined,
      difficulty: (searchParams.get('difficulty') as 'EASY' | 'MEDIUM' | 'HARD') || undefined,
      type:
        (searchParams.get('type') as 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY' | 'TRUE_FALSE') ||
        undefined,
      textbookId: searchParams.get('textbookId') || undefined,
      isAIGenerated:
        searchParams.get('isAIGenerated') === 'true'
          ? true
          : searchParams.get('isAIGenerated') === 'false'
            ? false
            : undefined,
      reviewStatus:
        (searchParams.get('reviewStatus') as
          | 'PENDING'
          | 'APPROVED'
          | 'REJECTED'
          | 'NEEDS_REVISION') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const parsed = ProblemListQueryDto.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const result = await problemService.getProblems(parsed.data);

    // 응답 스키마 검증
    const response = ProblemListResponseSchema.parse({
      problems: result.problems,
      pagination: result.pagination,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('문제 목록 조회 API 오류', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '문제 목록 조회에 실패했습니다.' }, { status: 500 });
  }
}

/**
 * 문제 생성
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateProblemDto.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const problem = await problemService.createProblem(parsed.data, session.user.id);

    // 응답 스키마 검증
    const response = ProblemResponseDto.parse(problem);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logger.error('문제 생성 API 오류', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '문제 생성에 실패했습니다.' }, { status: 500 });
  }
}
