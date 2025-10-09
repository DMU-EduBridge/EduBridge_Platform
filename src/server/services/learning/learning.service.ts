import { prisma } from '@/lib/core/prisma';

export class LearningService {
  async getCompleteStatus(userId: string, studyId: string, startNewAttempt?: boolean | number) {
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
        userId,
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
      attemptNumbers.length > 0 ? (attemptNumbers[attemptNumbers.length - 1] as number) : 0;

    // 현재 활성 시도 번호 계산 (Progress Service 로직과 동일)
    let activeAttemptNumber: number;

    if (startNewAttempt) {
      if (typeof startNewAttempt === 'number') {
        // 숫자로 전달된 경우 해당 시도 번호 사용 (새로운 시도 시작)
        activeAttemptNumber = startNewAttempt;
      } else {
        // boolean으로 전달된 경우 기존 로직 사용
        activeAttemptNumber = latestAttemptNumber + 1;
      }
    } else if (latestAttemptNumber > 0) {
      // 모든 시도 번호를 확인하여 완료된 시도가 있는지 찾기
      const attemptNumbers = Array.from(
        new Set(completedAttempts.map((entry) => entry.attemptNumber)),
      ).sort((a, b) => a - b);

      let completedAttemptNumber = 0;

      // 각 시도 번호별로 완료 여부 확인
      for (const attemptNum of attemptNumbers) {
        const attemptEntries = completedAttempts.filter(
          (attempt) => attempt.attemptNumber === attemptNum,
        );
        const uniqueCount = new Set(attemptEntries.map((attempt) => attempt.problemId)).size;
        const isCompleted = uniqueCount >= allProblems.length && allProblems.length > 0;

        if (isCompleted) {
          completedAttemptNumber = attemptNum;
        }
      }

      // 완료된 시도가 있으면 해당 시도 번호 사용, 없으면 최신 시도 번호 사용
      activeAttemptNumber =
        completedAttemptNumber > 0 ? completedAttemptNumber : latestAttemptNumber;
    } else {
      // 첫 번째 시도
      activeAttemptNumber = 1;
    }

    // startNewAttempt가 있으면 해당 시도 번호의 데이터를 조회, 없으면 최신 시도 번호의 데이터를 조회
    const targetAttemptNumber = startNewAttempt ? activeAttemptNumber : latestAttemptNumber;
    const latestAttemptEntries = completedAttempts.filter(
      (attempt) => attempt.attemptNumber === targetAttemptNumber,
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
    // startNewAttempt가 있으면 새로운 시도이므로 완료되지 않은 상태로 처리
    const isCompleted = startNewAttempt
      ? false
      : completedProblems.length === allProblems.length && allProblems.length > 0;

    return {
      totalProblems: allProblems.length,
      completedProblems: completedProblems.length,
      correctAnswers,
      wrongAnswers: wrongAnswers,
      isCompleted,
      attemptNumber: activeAttemptNumber, // 현재 활성 시도 번호 사용
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
    };
  }

  async resetCompleteStatus(userId: string, studyId: string) {
    // 해당 학습 자료의 모든 진행 상태 삭제
    await prisma.problemProgress.deleteMany({
      where: {
        userId,
        studyId: studyId,
      },
    });

    return { success: true };
  }
}

export const learningService = new LearningService();
