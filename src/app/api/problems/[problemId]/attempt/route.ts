import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { attemptService } from '@/server/services/attempt.service';
import { problemService } from '@/server/services/problem/problem-crud.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SubmitAnswerRequest {
  answer: string;
  timeSpent: number; // 초 단위
  studyId: string;
}

/**
 * 문제 정답 제출 및 채점
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { problemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 학생만 제출 가능
    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body: SubmitAnswerRequest = await request.json();
    const { answer, timeSpent, studyId } = body;

    if (!answer || timeSpent < 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // 문제 정보 가져오기
    const problem = await problemService.getProblemById(params.problemId);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // 정답 검증
    const isCorrect = await problemService.checkAnswer(params.problemId, answer);

    // 시도 기록 저장
    const attempt = await attemptService.createAttempt({
      userId: session.user.id,
      problemId: params.problemId,
      answer: answer,
      isCorrect: isCorrect,
      timeSpent: timeSpent,
      studyId: studyId,
    });

    logger.info('정답 제출 완료', {
      userId: session.user.id,
      problemId: params.problemId,
      isCorrect: isCorrect,
      timeSpent: timeSpent,
      attemptId: attempt.id,
    });

    return NextResponse.json({
      success: true,
      isCorrect: isCorrect,
      attemptId: attempt.id,
      timeSpent: timeSpent,
      message: isCorrect ? '정답입니다!' : '틀렸습니다. 해설을 확인해보세요.',
    });
  } catch (error) {
    logger.error('정답 제출 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
      problemId: params.problemId,
    });
    return NextResponse.json({ error: '정답 제출에 실패했습니다.' }, { status: 500 });
  }
}
