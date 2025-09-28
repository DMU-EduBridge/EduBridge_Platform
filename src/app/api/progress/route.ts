import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// 진행 상태 저장 (임시 진행 상태)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { studyId, problemId, selectedAnswer, startTime } = body;

    if (!studyId || !problemId) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
    }

    // 임시 진행 상태를 Attempt 테이블에 저장 (isCorrect: false로 구분)
    const attempt = await prisma.attempt.upsert({
      where: {
        id: `${session.user.id}_${problemId}_temp`, // 임시 ID 생성
      },
      update: {
        selected: selectedAnswer,
        startedAt: startTime ? new Date(startTime) : new Date(),
        completedAt: new Date(),
        isCorrect: false, // 임시 진행 상태 표시 (완료되지 않음)
      },
      create: {
        id: `${session.user.id}_${problemId}_temp`, // 임시 ID 생성
        userId: session.user.id,
        problemId: problemId,
        selected: selectedAnswer,
        startedAt: startTime ? new Date(startTime) : new Date(),
        completedAt: new Date(),
        isCorrect: false, // 임시 진행 상태 표시 (완료되지 않음)
        timeSpent: 0,
      },
    });

    return NextResponse.json({ success: true, attempt });
  } catch (error) {
    console.error('진행 상태 저장 실패:', error);
    return NextResponse.json({ error: '진행 상태 저장에 실패했습니다.' }, { status: 500 });
  }
}

// 진행 상태 조회 (시도 기록에서 조회)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get('studyId');
    const problemId = searchParams.get('problemId');

    const whereClause: any = {
      userId: session.user.id,
    };

    if (problemId) {
      whereClause.problemId = problemId;
    } else if (studyId) {
      // 특정 학습 자료의 모든 문제에 대한 시도 기록
      whereClause.problem = {
        materialProblems: {
          some: {
            learningMaterialId: studyId,
          },
        },
      };
    }

    const attempts = await prisma.attempt.findMany({
      where: whereClause,
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            correctAnswer: true,
            points: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 임시 진행 상태만 필터링 (ID에 _temp가 포함된 것)
    const progressAttempts = attempts.filter((attempt) => attempt.id.includes('_temp'));

    return NextResponse.json({ success: true, progress: progressAttempts });
  } catch (error) {
    console.error('진행 상태 조회 실패:', error);
    return NextResponse.json({ error: '진행 상태 조회에 실패했습니다.' }, { status: 500 });
  }
}

// 진행 상태 삭제 (문제 완료 시) - 시도 기록 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get('studyId');
    const problemId = searchParams.get('problemId');

    if (!studyId) {
      return NextResponse.json({ error: 'studyId가 필요합니다.' }, { status: 400 });
    }

    const whereClause: any = {
      userId: session.user.id,
    };

    if (problemId) {
      whereClause.problemId = problemId;
    } else {
      // 특정 학습 자료의 모든 문제에 대한 시도 기록 삭제
      whereClause.problem = {
        materialProblems: {
          some: {
            learningMaterialId: studyId,
          },
        },
      };
    }

    await prisma.attempt.deleteMany({
      where: whereClause,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('진행 상태 삭제 실패:', error);
    return NextResponse.json({ error: '진행 상태 삭제에 실패했습니다.' }, { status: 500 });
  }
}
