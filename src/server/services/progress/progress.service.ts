import { prisma } from '@/lib/core/prisma';
import { ProgressPostSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

export class ProgressService {
  async saveProgress(userId: string, data: z.infer<typeof ProgressPostSchema>) {
    console.log('saveProgress called with:', { userId, data });

    const {
      studyId,
      problemId,
      selectedAnswer,
      isCorrect,
      attemptNumber,
      startTime,
      timeSpent,
      forceNewAttempt,
    } = data;

    const totalProblems = await prisma.learningMaterialProblem.count({
      where: { learningMaterialId: studyId },
    });

    // 문제가 학습 자료에 속하는지 검증
    const isProblemInStudy = await prisma.learningMaterialProblem.findFirst({
      where: { learningMaterialId: studyId, problemId },
      select: { id: true },
    });
    if (!isProblemInStudy) {
      throw new Error('PROBLEM_NOT_IN_STUDY');
    }

    if (totalProblems === 0) {
      throw new Error('NO_PROBLEMS');
    }

    const existingLatestAttempt = await prisma.problemProgress.findFirst({
      where: { userId, studyId },
      orderBy: [{ attemptNumber: 'desc' }, { completedAt: 'desc' }],
    });

    const latestAttemptNumber = existingLatestAttempt?.attemptNumber ?? 0;
    const parsedAttemptNumber = Number(attemptNumber);
    const hasProvidedAttemptNumber =
      Number.isFinite(parsedAttemptNumber) && parsedAttemptNumber > 0;

    let resolvedAttemptNumber: number;

    if (hasProvidedAttemptNumber) {
      resolvedAttemptNumber = Math.max(parsedAttemptNumber, latestAttemptNumber || 1);
    } else if (forceNewAttempt) {
      // forceNewAttempt가 true인 경우, 기존 시도가 완료되었는지 확인
      if (existingLatestAttempt) {
        const attemptEntries = await prisma.problemProgress.findMany({
          where: { userId, studyId, attemptNumber: existingLatestAttempt.attemptNumber },
          select: { problemId: true },
        });

        const uniqueProblemCount = new Set(attemptEntries.map((entry) => entry.problemId)).size;
        const attemptCompleted = uniqueProblemCount >= totalProblems;

        if (attemptCompleted) {
          resolvedAttemptNumber = existingLatestAttempt.attemptNumber + 1;
        } else {
          // 기존 시도가 완료되지 않았으면 기존 시도 계속 진행
          resolvedAttemptNumber = existingLatestAttempt.attemptNumber;
        }
      } else {
        resolvedAttemptNumber = 1;
      }
    } else if (existingLatestAttempt) {
      const attemptEntries = await prisma.problemProgress.findMany({
        where: { userId, studyId, attemptNumber: existingLatestAttempt.attemptNumber },
        select: { problemId: true },
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

    console.log('About to upsert with:', {
      userId,
      studyId,
      problemId,
      attemptNumber: resolvedAttemptNumber,
      selectedAnswer,
      isCorrect,
      startedAt,
      computedTimeSpent,
    });

    try {
      await prisma.problemProgress.upsert({
        where: {
          userId_studyId_problemId_attemptNumber: {
            userId,
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
          userId,
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
      console.log('Upsert successful');
    } catch (error) {
      console.error('Upsert failed:', error);
      throw error;
    }

    const attemptEntries = await prisma.problemProgress.findMany({
      where: { userId, studyId, attemptNumber: resolvedAttemptNumber },
      orderBy: { completedAt: 'asc' },
    });

    // 누락 문제 식별
    const allStudyProblems = await prisma.learningMaterialProblem.findMany({
      where: { learningMaterialId: studyId },
      select: { problemId: true },
    });
    const allProblemIds = new Set(allStudyProblems.map((p) => p.problemId));
    const attemptedIds = new Set(attemptEntries.map((e) => e.problemId));
    const missingProblemIds = Array.from(allProblemIds).filter((id) => !attemptedIds.has(id));

    const isAttemptCompleted = attemptEntries.length >= totalProblems && totalProblems > 0;

    return {
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
    };
  }

  async getProgress(userId: string, studyId: string, startNewAttempt?: boolean | number) {
    console.log('getProgress called with startNewAttempt:', startNewAttempt);

    const totalProblems = await prisma.learningMaterialProblem.count({
      where: { learningMaterialId: studyId },
    });

    const progressEntries = await prisma.problemProgress.findMany({
      where: { userId, studyId },
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

    console.log('latestAttemptNumber:', latestAttemptNumber);
    console.log('startNewAttempt:', startNewAttempt);

    if (startNewAttempt) {
      if (typeof startNewAttempt === 'number') {
        // 숫자로 전달된 경우 해당 시도 번호 사용
        activeAttemptNumber = startNewAttempt;
        console.log('Using startNewAttempt as number:', startNewAttempt);
      } else {
        // boolean으로 전달된 경우 기존 로직 사용
        activeAttemptNumber = latestAttemptNumber + 1;
        console.log('Using boolean logic, new attempt:', activeAttemptNumber);
      }
    } else if (latestAttemptNumber > 0) {
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

    console.log('Final activeAttemptNumber:', activeAttemptNumber);

    const currentAttemptEntries = progressEntries.filter(
      (entry) => entry.attemptNumber === activeAttemptNumber,
    );

    const completedProblems = currentAttemptEntries.length;

    const attemptHistory = attemptNumbers.map((number) => {
      const entries = progressEntries.filter((entry) => entry.attemptNumber === number);
      const correctCount = entries.filter((entry) => entry.isCorrect).length;
      const totalTime = entries.reduce((sum, entry) => sum + entry.timeSpent, 0);

      return {
        attemptNumber: number,
        attemptedProblems: entries.length,
        correctAnswers: correctCount,
        totalTimeSpent: totalTime,
        isCompleted: totalProblems > 0 ? entries.length >= totalProblems : false,
        correctnessRate: entries.length > 0 ? Math.round((correctCount / entries.length) * 100) : 0,
      };
    });

    const currentCorrectCount = currentAttemptEntries.filter((entry) => entry.isCorrect).length;
    const currentCorrectnessRate =
      currentAttemptEntries.length > 0
        ? Math.round((currentCorrectCount / currentAttemptEntries.length) * 100)
        : 0;

    return {
      totalProblems,
      attemptedProblems: completedProblems,
      correctAnswers: currentCorrectCount,
      correctnessRate: currentCorrectnessRate,
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
    };
  }

  async deleteProgress(userId: string, studyId: string, problemId?: string) {
    const deleted = await prisma.problemProgress.deleteMany({
      where: {
        userId,
        studyId,
        ...(problemId ? { problemId } : {}),
      },
    });

    return { deletedCount: deleted.count };
  }
}

export const progressService = new ProgressService();
