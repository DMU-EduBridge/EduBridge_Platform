import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// 문제 완료 상태 저장
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      studyId,
      problemId,
      selectedAnswer,
      isCorrect,
      attemptNumber,
      startTime,
      timeSpent,
      forceNewAttempt,
    } = body ?? {};

    if (!studyId || !problemId || !selectedAnswer || typeof isCorrect !== 'boolean') {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
    }

    const totalProblems = await prisma.learningMaterialProblem.count({
      where: {
        learningMaterialId: studyId,
      },
    });
    // 현재 제출한 problemId가 해당 학습(studyId)에 속하는지 검증
    const isProblemInStudy = await prisma.learningMaterialProblem.findFirst({
      where: { learningMaterialId: studyId, problemId },
      select: { id: true },
    });
    if (!isProblemInStudy) {
      return NextResponse.json(
        {
          error: '해당 문제는 이 학습 자료에 속하지 않습니다.',
          code: 'PROBLEM_NOT_IN_STUDY',
          studyId,
          problemId,
        },
        { status: 400 },
      );
    }

    if (totalProblems === 0) {
      return NextResponse.json(
        {
          error: '학습 자료에 등록된 문제가 없습니다.',
          code: 'NO_PROBLEMS',
        },
        { status: 400 },
      );
    }

    const existingLatestAttempt = await prisma.problemProgress.findFirst({
      where: {
        userId: session.user.id,
        studyId,
      },
      orderBy: [
        {
          attemptNumber: 'desc',
        },
        {
          completedAt: 'desc',
        },
      ],
    });

    const latestAttemptNumber = existingLatestAttempt?.attemptNumber ?? 0;
    const parsedAttemptNumber = Number(attemptNumber);
    const hasProvidedAttemptNumber =
      Number.isFinite(parsedAttemptNumber) && parsedAttemptNumber > 0;

    let resolvedAttemptNumber: number;

    if (hasProvidedAttemptNumber) {
      // 클라이언트가 명시한 시도 번호를 1순위로 신뢰
      // 단, 최신 시도 번호보다 작은 값으로 역행 저장되는 것을 방지
      resolvedAttemptNumber = Math.max(parsedAttemptNumber, latestAttemptNumber || 1);
    } else if (forceNewAttempt) {
      resolvedAttemptNumber = latestAttemptNumber + 1;
    } else if (existingLatestAttempt) {
      const attemptEntries = await prisma.problemProgress.findMany({
        where: {
          userId: session.user.id,
          studyId,
          attemptNumber: existingLatestAttempt.attemptNumber,
        },
        select: {
          problemId: true,
        },
      });

      const uniqueProblemCount = new Set(attemptEntries.map((entry) => entry.problemId)).size;
      const attemptCompleted = uniqueProblemCount >= totalProblems;

      resolvedAttemptNumber = attemptCompleted
        ? existingLatestAttempt.attemptNumber + 1
        : existingLatestAttempt.attemptNumber;
    } else {
      resolvedAttemptNumber = 1;
    }

    if (resolvedAttemptNumber < 1) {
      resolvedAttemptNumber = 1;
    }

    const startedAt = startTime ? new Date(startTime) : undefined;
    const computedTimeSpent = Number.isFinite(Number(timeSpent))
      ? Math.max(Number(timeSpent), 0)
      : startedAt
        ? Math.floor((Date.now() - startedAt.getTime()) / 1000)
        : 0;

    await prisma.problemProgress.upsert({
      where: {
        userId_studyId_problemId_attemptNumber: {
          userId: session.user.id,
          studyId,
          problemId,
          attemptNumber: resolvedAttemptNumber,
        },
      },
      update: {
        selectedAnswer,
        isCorrect,
        startedAt: startedAt ?? new Date(Date.now() - computedTimeSpent * 1000),
        completedAt: new Date(),
        timeSpent: computedTimeSpent,
        lastAccessed: new Date(),
      },
      create: {
        userId: session.user.id,
        studyId,
        problemId,
        attemptNumber: resolvedAttemptNumber,
        selectedAnswer,
        isCorrect,
        startedAt: startedAt ?? new Date(Date.now() - computedTimeSpent * 1000),
        completedAt: new Date(),
        timeSpent: computedTimeSpent,
        lastAccessed: new Date(),
      },
    });

    const attemptEntries = await prisma.problemProgress.findMany({
      where: {
        userId: session.user.id,
        studyId,
        attemptNumber: resolvedAttemptNumber,
      },
      orderBy: {
        completedAt: 'asc',
      },
    });

    // 누락 문제 식별 (학습 자료에 연결된 전체 problemId 집합과 현재 시도 엔트리 비교)
    const allStudyProblems = await prisma.learningMaterialProblem.findMany({
      where: { learningMaterialId: studyId },
      select: { problemId: true },
    });
    const allProblemIds = new Set(allStudyProblems.map((p) => p.problemId));
    const attemptedIds = new Set(attemptEntries.map((e) => e.problemId));
    const missingProblemIds = Array.from(allProblemIds).filter((id) => !attemptedIds.has(id));

    const isAttemptCompleted = attemptEntries.length >= totalProblems && totalProblems > 0;

    return NextResponse.json({
      success: true,
      data: {
        attemptNumber: resolvedAttemptNumber,
        totalProblems,
        completedProblems: attemptEntries.length,
        isAttemptCompleted,
        progress: attemptEntries.map((entry) => ({
          problemId: entry.problemId,
          selectedAnswer: entry.selectedAnswer,
          isCorrect: entry.isCorrect,
          attemptNumber: entry.attemptNumber,
          startedAt: entry.startedAt?.toISOString(),
          completedAt: entry.completedAt?.toISOString(),
          timeSpent: entry.timeSpent,
        })),
        missingProblemIds,
      },
    });
  } catch (error) {
    console.error('문제 완료 상태 저장 실패:', error);
    return NextResponse.json(
      {
        error: '문제 완료 상태 저장에 실패했습니다.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// 학습 진행 상태 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get('studyId');
    const startNewAttempt = searchParams.get('startNewAttempt') === 'true';

    if (!studyId) {
      return NextResponse.json({ error: 'studyId가 필요합니다.' }, { status: 400 });
    }

    const totalProblems = await prisma.learningMaterialProblem.count({
      where: {
        learningMaterialId: studyId,
      },
    });

    const progressEntries = await prisma.problemProgress.findMany({
      where: {
        userId: session.user.id,
        studyId,
      },
      orderBy: [{ attemptNumber: 'asc' }, { completedAt: 'asc' }],
    });

    const attemptNumbers = Array.from(
      new Set(
        progressEntries
          .map((entry) => entry.attemptNumber)
          .filter((value): value is number => typeof value === 'number'),
      ),
    ).sort((a, b) => a - b);

    const latestAttemptNumber =
      attemptNumbers.length > 0 && typeof attemptNumbers[attemptNumbers.length - 1] === 'number'
        ? (attemptNumbers[attemptNumbers.length - 1] as number)
        : 0;

    let activeAttemptNumber: number = latestAttemptNumber;

    if (startNewAttempt) {
      activeAttemptNumber = latestAttemptNumber + 1;
    } else if (latestAttemptNumber > 0) {
      // 가장 최근 시도가 완료되지 않았다면 해당 시도를 이어서 진행
      const latestEntries = progressEntries.filter(
        (entry) => entry.attemptNumber === latestAttemptNumber,
      );
      const latestUniqueCount = new Set(latestEntries.map((entry) => entry.problemId)).size;
      const latestCompleted = latestUniqueCount >= totalProblems && totalProblems > 0;

      if (!latestCompleted) {
        activeAttemptNumber = latestAttemptNumber;
      } else {
        activeAttemptNumber = latestAttemptNumber;
      }
    }

    if (activeAttemptNumber < 1) {
      activeAttemptNumber = 1;
    }

    const currentAttemptEntries = progressEntries.filter(
      (entry) => entry.attemptNumber === activeAttemptNumber,
    );

    // 현재 시도에서 시도한 모든 문제를 완료로 계산 (정답 여부와 관계없이)
    const completedProblems = currentAttemptEntries.length;

    const attemptHistory = attemptNumbers.map((number) => {
      const entries = progressEntries.filter((entry) => entry.attemptNumber === number);
      const correctCount = entries.filter((entry) => entry.isCorrect).length;
      const totalTime = entries.reduce((sum, entry) => sum + entry.timeSpent, 0);

      return {
        attemptNumber: number,
        attemptedProblems: entries.length, // 시도한 모든 문제 수
        correctAnswers: correctCount, // 정답을 맞춘 문제 수
        totalTimeSpent: totalTime,
        isCompleted: totalProblems > 0 ? entries.length >= totalProblems : false,
        correctnessRate: entries.length > 0 ? Math.round((correctCount / entries.length) * 100) : 0,
      };
    });

    // 현재 시도의 정답률 계산
    const currentCorrectCount = currentAttemptEntries.filter((entry) => entry.isCorrect).length;
    const currentCorrectnessRate =
      currentAttemptEntries.length > 0
        ? Math.round((currentCorrectCount / currentAttemptEntries.length) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalProblems,
        attemptedProblems: completedProblems, // 시도한 문제 수
        correctAnswers: currentCorrectCount, // 정답 문제 수
        correctnessRate: currentCorrectnessRate, // 정답률 (%)
        activeAttemptNumber,
        progress: currentAttemptEntries.map((entry) => ({
          problemId: entry.problemId,
          attemptNumber: entry.attemptNumber,
          selectedAnswer: entry.selectedAnswer,
          isCorrect: entry.isCorrect,
          startedAt: entry.startedAt?.toISOString(),
          completedAt: entry.completedAt?.toISOString(),
          timeSpent: entry.timeSpent,
        })),
        attemptHistory,
        latestAttemptNumber,
        isLatestAttemptCompleted: totalProblems > 0 ? completedProblems >= totalProblems : false,
      },
    });
  } catch (error) {
    console.error('학습 진행 상태 조회 실패:', error);
    return NextResponse.json({ error: '학습 진행 상태 조회에 실패했습니다.' }, { status: 500 });
  }
}

// 문제 진행 상태 삭제 (재시도용)
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

    // 특정 문제의 진행 상태 삭제 (재시도용)
    const deleted = await prisma.problemProgress.deleteMany({
      where: {
        userId: session.user.id,
        studyId,
        ...(problemId ? { problemId } : {}),
      },
    });

    console.log(
      `진행 상태 삭제: userId=${session.user.id}, studyId=${studyId}, problemId=${problemId}, deletedCount=${deleted.count}`,
    );

    return NextResponse.json({ success: true, deletedCount: deleted.count });
  } catch (error) {
    console.error('문제 진행 상태 삭제 실패:', error);
    return NextResponse.json({ error: '문제 진행 상태 삭제에 실패했습니다.' }, { status: 500 });
  }
}
