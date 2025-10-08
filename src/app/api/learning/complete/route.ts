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

    // 완료된 문제 조회 (ProblemProgress 테이블 사용)
    const completedAttempts = await prisma.problemProgress.findMany({
      where: {
        userId: session.user.id,
        studyId: studyId,
      },
      select: {
        problemId: true,
        attemptNumber: true,
        isCorrect: true,
        selectedAnswer: true,
        completedAt: true,
        timeSpent: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    const attemptNumbers = Array.from(
      new Set(completedAttempts.map((attempt) => attempt.attemptNumber)),
    ).sort((a, b) => a - b);
    const latestAttemptNumber =
      attemptNumbers.length > 0 ? attemptNumbers[attemptNumbers.length - 1] : 1;

    const latestAttemptEntries = completedAttempts.filter(
      (attempt) => attempt.attemptNumber === latestAttemptNumber,
    );

    const latestAttempts = new Map();
    latestAttemptEntries.forEach((attempt) => {
      if (
        !latestAttempts.has(attempt.problemId) ||
        (attempt.completedAt &&
          latestAttempts.get(attempt.problemId)?.completedAt &&
          attempt.completedAt > latestAttempts.get(attempt.problemId).completedAt)
      ) {
        latestAttempts.set(attempt.problemId, attempt);
      }
    });

    const completedProblems = Array.from(latestAttempts.keys());
    // 누락 문제 식별: 자료의 전체 문제와 최신 시도 문제 비교
    const allProblemIds = new Set(allProblems.map((p) => p.id));
    const attemptedIds = new Set(completedProblems);
    const missingProblemIds = Array.from(allProblemIds).filter((id) => !attemptedIds.has(id));
    const correctAnswers = Array.from(latestAttempts.values()).filter((a) => a.isCorrect).length;
    const wrongAnswers = completedProblems.length - correctAnswers;

    // 모든 문제가 완료되었는지 확인 (정확한 개수 비교)
    const isCompleted = completedProblems.length === allProblems.length && allProblems.length > 0;

    return NextResponse.json({
      success: true,
      data: {
        totalProblems: allProblems.length,
        completedProblems: completedProblems.length,
        correctAnswers,
        wrongAnswers: wrongAnswers,
        isCompleted,
        attemptNumber: latestAttemptNumber,
        attempts: Array.from(latestAttempts.values()).map((attempt) => ({
          problemId: attempt.problemId,
          isCorrect: attempt.isCorrect,
          selected: attempt.selectedAnswer,
          createdAt: attempt.completedAt,
          attemptNumber: attempt.attemptNumber,
          timeSpent: attempt.timeSpent,
        })), // 최신 시도만 (결과 페이지용)
        latestAttempts: Array.from(latestAttempts.values()), // 최신 시도만 (완료 상태 판단용)
        missingProblemIds,
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

    // 해당 학습 자료의 모든 진행 상태 삭제
    await prisma.problemProgress.deleteMany({
      where: {
        userId: session.user.id,
        studyId: studyId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('학습 완료 상태 초기화 실패:', error);
    return NextResponse.json({ error: '학습 완료 상태 초기화에 실패했습니다.' }, { status: 500 });
  }
}
