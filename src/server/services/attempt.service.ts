import { Attempt } from '@prisma/client';
import { prisma } from '../../lib/core/prisma';
import { logger } from '../../lib/monitoring';

export interface CreateAttemptRequest {
  userId: string;
  problemId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number; // 초 단위
  studyId?: string;
  attemptNumber?: number;
  startedAt?: Date;
}

export interface UpdateAttemptRequest {
  answer?: string;
  isCorrect?: boolean;
  timeSpent?: number;
}

export class AttemptService {
  /**
   * 새로운 시도 기록 생성
   */
  async createAttempt(data: CreateAttemptRequest): Promise<Attempt> {
    try {
      const attempt = await prisma.attempt.create({
        data: {
          userId: data.userId,
          problemId: data.problemId,
          selected: data.answer, // answer -> selected로 변경
          isCorrect: data.isCorrect,
          timeSpent: data.timeSpent,
          studyId: data.studyId ?? null,
          attemptNumber: data.attemptNumber && data.attemptNumber > 0 ? data.attemptNumber : 1,
          startedAt: data.startedAt ?? new Date(),
          completedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          problem: {
            select: {
              id: true,
              title: true,
              subject: true,
              difficulty: true,
            },
          },
        },
      });

      logger.info('시도 기록 생성 완료', {
        attemptId: attempt.id,
        userId: data.userId,
        problemId: data.problemId,
        isCorrect: data.isCorrect,
        timeSpent: data.timeSpent,
        studyId: data.studyId,
        attemptNumber: attempt.attemptNumber,
      });

      // ProblemProgress 동기화: studyId가 있는 경우에만 기록
      if (data.studyId) {
        const resolvedAttemptNumber =
          data.attemptNumber && data.attemptNumber > 0 ? data.attemptNumber : attempt.attemptNumber;

        await prisma.problemProgress.upsert({
          where: {
            userId_studyId_problemId_attemptNumber: {
              userId: data.userId,
              studyId: data.studyId,
              problemId: data.problemId,
              attemptNumber: resolvedAttemptNumber,
            },
          },
          update: {
            selectedAnswer: data.answer,
            isCorrect: data.isCorrect,
            startedAt: attempt.startedAt,
            completedAt: attempt.completedAt ?? new Date(),
            timeSpent: data.timeSpent,
            lastAccessed: new Date(),
          },
          create: {
            userId: data.userId,
            studyId: data.studyId,
            problemId: data.problemId,
            attemptNumber: resolvedAttemptNumber,
            selectedAnswer: data.answer,
            isCorrect: data.isCorrect,
            startedAt: attempt.startedAt,
            completedAt: attempt.completedAt ?? new Date(),
            timeSpent: data.timeSpent,
            lastAccessed: new Date(),
          },
        });

        logger.info('ProblemProgress 동기화 완료', {
          userId: data.userId,
          studyId: data.studyId,
          problemId: data.problemId,
          attemptNumber: resolvedAttemptNumber,
        });
      }

      return attempt;
    } catch (error) {
      logger.error('시도 기록 생성 실패', undefined, {
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('시도 기록 생성에 실패했습니다.');
    }
  }

  /**
   * 시도 기록 업데이트
   */
  async updateAttempt(id: string, data: UpdateAttemptRequest): Promise<Attempt> {
    try {
      const attempt = await prisma.attempt.update({
        where: { id },
        data: {
          ...(data.answer && { selected: data.answer }), // answer -> selected로 변경
          ...(data.isCorrect !== undefined && { isCorrect: data.isCorrect }),
          ...(data.timeSpent !== undefined && { timeSpent: data.timeSpent }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          problem: {
            select: {
              id: true,
              title: true,
              subject: true,
              difficulty: true,
            },
          },
        },
      });

      logger.info('시도 기록 업데이트 완료', {
        attemptId: id,
        data,
      });

      return attempt;
    } catch (error) {
      logger.error('시도 기록 업데이트 실패', undefined, {
        attemptId: id,
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('시도 기록 업데이트에 실패했습니다.');
    }
  }

  /**
   * 사용자별 문제별 시도 기록 조회
   */
  async getAttemptsByProblemAndUser(problemId: string, userId: string): Promise<Attempt[]> {
    try {
      return await prisma.attempt.findMany({
        where: {
          problemId,
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              subject: true,
              difficulty: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('시도 기록 조회 실패', undefined, {
        problemId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('시도 기록 조회에 실패했습니다.');
    }
  }

  /**
   * 사용자의 최근 시도 기록 조회
   */
  async getRecentAttemptsByUser(userId: string, limit: number = 10): Promise<Attempt[]> {
    try {
      return await prisma.attempt.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              subject: true,
              difficulty: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('최근 시도 기록 조회 실패', undefined, {
        userId,
        limit,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('최근 시도 기록 조회에 실패했습니다.');
    }
  }

  /**
   * 문제별 통계 조회
   */
  async getProblemStats(problemId: string): Promise<{
    totalAttempts: number;
    correctAttempts: number;
    averageTimeSpent: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  }> {
    try {
      const stats = await prisma.attempt.aggregate({
        where: {
          problemId,
        },
        _count: {
          id: true,
        },
        _avg: {
          timeSpent: true,
        },
      });

      const correctCount = await prisma.attempt.count({
        where: {
          problemId,
          isCorrect: true,
        },
      });

      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        select: { difficulty: true },
      });

      return {
        totalAttempts: stats._count.id,
        correctAttempts: correctCount,
        averageTimeSpent: Math.round(stats._avg.timeSpent || 0),
        difficulty: (problem?.difficulty as 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT') || 'MEDIUM',
      };
    } catch (error) {
      logger.error('문제 통계 조회 실패', undefined, {
        problemId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('문제 통계 조회에 실패했습니다.');
    }
  }

  /**
   * 사용자별 학습 통계 조회
   */
  async getUserLearningStats(userId: string): Promise<{
    totalAttempts: number;
    correctAttempts: number;
    averageTimeSpent: number;
    subjects: Array<{
      subject: string;
      attempts: number;
      correctRate: number;
    }>;
  }> {
    try {
      const stats = await prisma.attempt.aggregate({
        where: {
          userId,
        },
        _count: {
          id: true,
        },
        _avg: {
          timeSpent: true,
        },
      });

      const correctCount = await prisma.attempt.count({
        where: {
          userId,
          isCorrect: true,
        },
      });

      // 과목별 통계
      const subjectStats = await prisma.attempt.groupBy({
        by: ['problemId'],
        where: {
          userId,
        },
        _count: {
          id: true,
        },
      });

      const subjects = await Promise.all(
        subjectStats.map(async (stat) => {
          const problem = await prisma.problem.findUnique({
            where: { id: stat.problemId },
            select: { subject: true },
          });

          // 해당 문제의 정답률 계산
          const correctCount = await prisma.attempt.count({
            where: {
              userId,
              problemId: stat.problemId,
              isCorrect: true,
            },
          });

          return {
            subject: problem?.subject || 'Unknown',
            attempts: stat._count.id,
            correctRate: stat._count.id > 0 ? Math.round((correctCount / stat._count.id) * 100) : 0,
          };
        }),
      );

      return {
        totalAttempts: stats._count.id,
        correctAttempts: correctCount,
        averageTimeSpent: Math.round(stats._avg.timeSpent || 0),
        subjects,
      };
    } catch (error) {
      logger.error('사용자 학습 통계 조회 실패', undefined, {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('사용자 학습 통계 조회에 실패했습니다.');
    }
  }
}

export const attemptService = new AttemptService();
