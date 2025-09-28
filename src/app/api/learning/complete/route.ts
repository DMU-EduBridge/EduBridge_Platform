import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// 학습 완료 상태 조회
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

    // 해당 학습 자료의 모든 문제 조회
    const allProblems = await prisma.problem.findMany({
      where: {
        materialProblems: {
          some: {
            learningMaterialId: studyId,
          },
        },
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    // 완료된 문제 조회 (임시 진행 상태 제외)
    const completedAttempts = await prisma.attempt.findMany({
      where: {
        userId: session.user.id,
        problemId: {
          in: allProblems.map((p) => p.id),
        },
        // 임시 진행 상태 제외 (ID에 _temp가 포함되지 않은 것만)
        id: {
          not: {
            contains: '_temp',
          },
        },
      },
      select: {
        problemId: true,
        isCorrect: true,
        selected: true, // 스키마에 맞게 수정
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 문제별 최신 시도 기록만 추출 (완료된 문제 판단용)
    const latestAttempts = new Map();
    completedAttempts.forEach((attempt) => {
      if (!latestAttempts.has(attempt.problemId)) {
        latestAttempts.set(attempt.problemId, attempt);
      }
    });

    const completedProblems = Array.from(latestAttempts.keys());
    const correctAnswers = Array.from(latestAttempts.values()).filter((a) => a.isCorrect).length;

    // 모든 문제가 완료되었는지 확인 (정확한 개수 비교)
    const isCompleted = completedProblems.length === allProblems.length && allProblems.length > 0;

    return NextResponse.json({
      success: true,
      data: {
        totalProblems: allProblems.length,
        completedProblems: completedProblems.length,
        correctAnswers,
        wrongAnswers: completedProblems.length - correctAnswers,
        isCompleted,
        attempts: Array.from(latestAttempts.values()), // 최신 시도만 (완료 상태 판단용)
        allAttempts: completedAttempts, // 모든 시도 기록 (분석용)
      },
    });
  } catch (error) {
    console.error('학습 완료 상태 조회 실패:', error);
    return NextResponse.json({ error: '학습 완료 상태 조회에 실패했습니다.' }, { status: 500 });
  }
}

// 학습 완료 상태 초기화 (다시 풀기용)
export async function DELETE(request: NextRequest) {
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

    // 해당 학습 자료의 모든 문제 조회
    const allProblems = await prisma.problem.findMany({
      where: {
        materialProblems: {
          some: {
            learningMaterialId: studyId,
          },
        },
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    // 해당 학습 자료의 모든 시도 기록 삭제 (완료된 문제들)
    await prisma.attempt.deleteMany({
      where: {
        userId: session.user.id,
        problemId: {
          in: allProblems.map((p) => p.id),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('학습 완료 상태 초기화 실패:', error);
    return NextResponse.json({ error: '학습 완료 상태 초기화에 실패했습니다.' }, { status: 500 });
  }
}
