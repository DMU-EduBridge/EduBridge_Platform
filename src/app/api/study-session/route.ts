import { authOptions } from '@/lib/core/auth';
export const runtime = 'nodejs';
import { studySessionService } from '@/services/study-session.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// 학습 세션 조회 또는 생성
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get('studyId');

    if (!studyId) {
      return NextResponse.json({ error: 'studyId가 필요합니다.' }, { status: 400 });
    }

    // 최신 학습 세션 조회
    const result = await studySessionService.getLatestSession(session.user.id, studyId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('학습 세션 조회 실패:', error);
    return NextResponse.json({ error: '학습 세션 조회에 실패했습니다.' }, { status: 500 });
  }
}

// 새로운 학습 세션 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { studyId, totalProblems } = body;

    if (!studyId || !totalProblems) {
      return NextResponse.json({ error: 'studyId와 totalProblems가 필요합니다.' }, { status: 400 });
    }

    // 새로운 학습 세션 생성
    const result = await studySessionService.createSession({
      userId: session.user.id,
      studyId,
      totalProblems,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('학습 세션 생성 실패:', error);
    return NextResponse.json({ error: '학습 세션 생성에 실패했습니다.' }, { status: 500 });
  }
}

// 학습 세션 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, completedProblems, isCompleted } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId가 필요합니다.' }, { status: 400 });
    }

    // 학습 세션 업데이트
    const result = await studySessionService.updateSession(sessionId, {
      completedProblems,
      isCompleted,
      completedAt: isCompleted ? new Date() : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('학습 세션 업데이트 실패:', error);
    return NextResponse.json({ error: '학습 세션 업데이트에 실패했습니다.' }, { status: 500 });
  }
}

// 학습 세션 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId가 필요합니다.' }, { status: 400 });
    }

    // 학습 세션 삭제
    const result = await studySessionService.deleteSession(sessionId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('학습 세션 삭제 실패:', error);
    return NextResponse.json({ error: '학습 세션 삭제에 실패했습니다.' }, { status: 500 });
  }
}
