import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { CreateProblemSchema, ProblemQuerySchema } from '@/lib/validation/schemas';
import { problemsService } from '@/server/services/problems/problems.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 문제 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = ProblemQuerySchema.parse({
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      subject: searchParams.get('subject') || undefined,
      gradeLevel: searchParams.get('gradeLevel') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      createdBy: searchParams.get('createdBy') || undefined,
      creationType: searchParams.get('creationType') || undefined,
    });

    const result = await problemsService.getProblems(query);
    logger.info('문제 목록 조회 성공', { userId: session.user.id, count: result.problems.length });
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    logger.error('문제 목록 조회 실패', undefined, { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * 문제 생성
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = CreateProblemSchema.parse(body);

    const problem = await problemsService.createProblem(data, session.user.id);
    logger.info('문제 생성 성공', { userId: session.user.id, problemId: problem.id });
    return NextResponse.json({ success: true, data: problem }, { status: 201 });
  } catch (error: any) {
    logger.error('문제 생성 실패', undefined, { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
