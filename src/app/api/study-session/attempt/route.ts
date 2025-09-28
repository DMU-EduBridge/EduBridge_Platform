import { authOptions } from '@/lib/core/auth';
export const runtime = 'nodejs';
import { studySessionService } from '@/services/study-session.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// 학습 세션에 문제 시도 추가
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, problemId, selected, isCorrect, timeSpent, classId } = body;

    if (!sessionId || !problemId || !selected || typeof isCorrect !== 'boolean') {
      return NextResponse.json(
        {
          error: 'sessionId, problemId, selected, isCorrect가 필요합니다.',
        },
        { status: 400 },
      );
    }

    // 학습 세션에 문제 시도 추가
    const result = await studySessionService.addAttempt(sessionId, {
      userId: session.user.id,
      problemId,
      selected,
      isCorrect,
      timeSpent,
      classId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('문제 시도 추가 실패:', error);
    return NextResponse.json({ error: '문제 시도 추가에 실패했습니다.' }, { status: 500 });
  }
}
