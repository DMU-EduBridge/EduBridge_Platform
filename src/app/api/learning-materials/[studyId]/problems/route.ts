import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { problemService } from '@/server/services/problem/problem-crud.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 학습 자료별 문제 목록 조회
 */
export async function GET(request: NextRequest, { params }: { params: { studyId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 학생만 접근 가능
    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 학습 자료에 연결된 문제들 가져오기
    const problems = await problemService.getProblemsByStudyId(params.studyId, {
      page,
      limit,
    });

    logger.info('학습 자료 문제 목록 조회 완료', {
      studyId: params.studyId,
      userId: session.user.id,
      problemCount: problems.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        problems,
        pagination: {
          page,
          limit,
          total: problems.length,
        },
      },
    });
  } catch (error) {
    logger.error('학습 자료 문제 목록 조회 실패', undefined, {
      studyId: params.studyId,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '문제 목록 조회에 실패했습니다.' }, { status: 500 });
  }
}
