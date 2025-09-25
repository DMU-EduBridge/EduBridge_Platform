import { prisma } from '../../../lib/core/prisma';
import { handlePrismaError } from '../../../lib/errors';
import { logger } from '../../../lib/monitoring';

export class ProblemStatsService {
  /**
   * 문제 통계 조회
   */
  async getProblemStats(): Promise<any> {
    try {
      const [
        totalProblems,
        publishedProblems,
        draftProblems,
        archivedProblems,
        aiGeneratedProblems,
        byDifficulty,
        byType,
        bySubject,
        recentProblems,
      ] = await Promise.all([
        prisma.problem.count(),
        prisma.problem.count({ where: { status: 'PUBLISHED' } }),
        prisma.problem.count({ where: { status: 'DRAFT' } }),
        prisma.problem.count({ where: { status: 'ARCHIVED' } }),
        prisma.problem.count({ where: { isAIGenerated: true } }),
        prisma.problem.groupBy({
          by: ['difficulty'],
          _count: { difficulty: true },
        }),
        prisma.problem.groupBy({
          by: ['type'],
          _count: { type: true },
        }),
        prisma.problem.groupBy({
          by: ['subject'],
          _count: { subject: true },
        }),
        prisma.problem.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            createdAt: true,
            creator: {
              select: {
                name: true,
              },
            },
          },
        }),
      ]);

      const difficultyStats = byDifficulty.reduce(
        (acc, stat) => {
          acc[stat.difficulty] = stat._count.difficulty;
          return acc;
        },
        {} as Record<string, number>,
      );

      const typeStats = byType.reduce(
        (acc, stat) => {
          acc[stat.type] = stat._count.type;
          return acc;
        },
        {} as Record<string, number>,
      );

      const subjectStats = bySubject.reduce(
        (acc, stat) => {
          acc[stat.subject] = stat._count.subject;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        total: totalProblems,
        published: publishedProblems,
        draft: draftProblems,
        archived: archivedProblems,
        aiGenerated: aiGeneratedProblems,
        byDifficulty: difficultyStats,
        byType: typeStats,
        bySubject: subjectStats,
        recentProblems,
      };
    } catch (error) {
      logger.error('문제 통계 조회 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error);
    }
  }

  /**
   * 사용자별 문제 통계
   */
  async getUserProblemStats(userId: string): Promise<any> {
    try {
      const [createdProblems, publishedProblems, draftProblems, totalAttempts, correctAttempts] =
        await Promise.all([
          prisma.problem.count({ where: { createdBy: userId } }),
          prisma.problem.count({ where: { createdBy: userId, status: 'PUBLISHED' } }),
          prisma.problem.count({ where: { createdBy: userId, status: 'DRAFT' } }),
          prisma.attempt.count({ where: { problem: { createdBy: userId } } }),
          prisma.attempt.count({ where: { problem: { createdBy: userId }, isCorrect: true } }),
        ]);

      const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

      return {
        created: createdProblems,
        published: publishedProblems,
        draft: draftProblems,
        totalAttempts,
        correctAttempts,
        accuracy: Math.round(accuracy * 100) / 100,
      };
    } catch (error) {
      logger.error('사용자 문제 통계 조회 실패', undefined, {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error);
    }
  }

  /**
   * 문제별 시도 통계
   */
  async getProblemAttemptStats(problemId: string): Promise<any> {
    try {
      const [totalAttempts, correctAttempts, averageTimeSpent, attemptsByUser, recentAttempts] =
        await Promise.all([
          prisma.attempt.count({ where: { problemId } }),
          prisma.attempt.count({ where: { problemId, isCorrect: true } }),
          prisma.attempt.aggregate({
            where: { problemId },
            _avg: { timeSpent: true },
          }),
          prisma.attempt.groupBy({
            by: ['userId'],
            where: { problemId },
            _count: { userId: true },
            _avg: { timeSpent: true },
          }),
          prisma.attempt.findMany({
            where: { problemId },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          }),
        ]);

      const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

      return {
        totalAttempts,
        correctAttempts,
        accuracy: Math.round(accuracy * 100) / 100,
        averageTimeSpent: averageTimeSpent._avg.timeSpent || 0,
        attemptsByUser: attemptsByUser.map((attempt) => ({
          userId: attempt.userId,
          count: attempt._count.userId,
          averageTimeSpent: attempt._avg.timeSpent || 0,
        })),
        recentAttempts,
      };
    } catch (error) {
      logger.error('문제 시도 통계 조회 실패', undefined, {
        problemId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error);
    }
  }

  /**
   * 과목별 문제 통계
   */
  async getSubjectProblemStats(subject: string): Promise<any> {
    try {
      const [totalProblems, publishedProblems, byDifficulty, byType, averageAttempts] =
        await Promise.all([
          prisma.problem.count({ where: { subject } }),
          prisma.problem.count({ where: { subject, status: 'PUBLISHED' } }),
          prisma.problem.groupBy({
            by: ['difficulty'],
            where: { subject },
            _count: { difficulty: true },
          }),
          prisma.problem.groupBy({
            by: ['type'],
            where: { subject },
            _count: { type: true },
          }),
          prisma.attempt.aggregate({
            where: { problem: { subject } },
            _avg: { timeSpent: true },
            _count: { id: true },
          }),
        ]);

      const difficultyStats = byDifficulty.reduce(
        (acc, stat) => {
          acc[stat.difficulty] = stat._count.difficulty;
          return acc;
        },
        {} as Record<string, number>,
      );

      const typeStats = byType.reduce(
        (acc, stat) => {
          acc[stat.type] = stat._count.type;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        subject,
        totalProblems,
        publishedProblems,
        byDifficulty: difficultyStats,
        byType: typeStats,
        totalAttempts: averageAttempts._count.id,
        averageTimeSpent: averageAttempts._avg.timeSpent || 0,
      };
    } catch (error) {
      logger.error('과목별 문제 통계 조회 실패', undefined, {
        subject,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error);
    }
  }
}
