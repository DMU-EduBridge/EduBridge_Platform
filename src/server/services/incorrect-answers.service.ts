/**
 * 오답노트 서비스
 */

import { prisma } from '@/lib/core/prisma';
import {
  calculateIncorrectAnswersStats,
  groupAttemptsByProblem,
  groupProblemsBySubject,
} from '@/lib/utils/incorrect-answers-utils';
import type { IncorrectAnswersData, ProgressRecord } from '@/types/incorrect-answers';

/**
 * 사용자의 오답 데이터를 조회합니다.
 */
export async function fetchUserIncorrectAnswers(userId: string): Promise<ProgressRecord[]> {
  return await prisma.problemProgress.findMany({
    where: { userId, isCorrect: false },
    orderBy: [{ completedAt: 'desc' }],
    select: {
      problemId: true,
      selectedAnswer: true,
      isCorrect: true,
      completedAt: true,
      attemptNumber: true,
      timeSpent: true,
      problem: {
        select: {
          id: true,
          title: true,
          content: true,
          subject: true,
          difficulty: true,
          explanation: true,
          correctAnswer: true,
          materialProblems: {
            select: { learningMaterialId: true },
            take: 1,
          },
        },
      },
    },
  });
}

/**
 * 오답노트 데이터를 생성합니다.
 */
export async function createIncorrectAnswersData(
  userId: string,
): Promise<IncorrectAnswersData | null> {
  try {
    // 사용자의 오답 데이터 조회
    const progresses = await fetchUserIncorrectAnswers(userId);

    // 문제별로 시도들을 그룹핑
    const attemptsByProblem = groupAttemptsByProblem(progresses);

    // 과목별로 문제들을 그룹핑
    const groups = groupProblemsBySubject(attemptsByProblem);

    // 결과 데이터 생성
    const incorrectAnswers = Array.from(groups.values());
    const subjects = incorrectAnswers.map((group) => group.subject);
    const stats = calculateIncorrectAnswersStats(incorrectAnswers);

    return {
      incorrectAnswers,
      subjects,
      stats,
    };
  } catch (error) {
    console.error('오답 노트 데이터 생성 실패:', error);
    return null;
  }
}
