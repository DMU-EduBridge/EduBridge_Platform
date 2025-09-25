import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';

export interface AnalyticsSummary {
  users: { total: number; teachers: number; students: number };
  problems: { total: number; aiGenerated: number };
  textbooks: { total: number; chunks: number };
  attempts: { total: number; correctRate: number };
}

/**
 * 애널리틱스 서비스
 * - 운영 지표 간단 요약 제공
 */
export class AnalyticsService {
  async getSummary(): Promise<AnalyticsSummary> {
    try {
      const [
        { total: totalUsers, teachers: teacherCount, students: studentCount },
        { total: totalProblems, aiGenerated: aiGeneratedCount },
        { total: totalTextbooks, chunks: totalChunks },
        { total: totalAttempts, correct: correctAttempts },
      ] = await Promise.all([
        // 사용자 통계
        prisma.user
          .groupBy({
            by: ['role'],
            _count: { role: true },
          })
          .then((result) => {
            const stats = { total: 0, teachers: 0, students: 0 };
            result.forEach((item) => {
              stats.total += item._count.role;
              if (item.role === 'TEACHER') stats.teachers = item._count.role;
              if (item.role === 'STUDENT') stats.students = item._count.role;
            });
            return stats;
          }),
        // 문제 통계
        prisma.problem
          .groupBy({
            by: ['isGeneratedByAI'],
            _count: { isGeneratedByAI: true },
          })
          .then((result) => {
            const stats = { total: 0, aiGenerated: 0 };
            result.forEach((item) => {
              stats.total += item._count.isGeneratedByAI;
              if (item.isGeneratedByAI) stats.aiGenerated = item._count.isGeneratedByAI;
            });
            return stats;
          }),
        // 교과서 통계
        Promise.all([prisma.textbook.count(), prisma.documentChunk.count()]).then(
          ([totalTextbooks, totalChunks]) => ({
            total: totalTextbooks,
            chunks: totalChunks,
          }),
        ),
        // 시도 통계
        Promise.all([
          prisma.attempt.count(),
          prisma.attempt.count({ where: { isCorrect: true } }),
        ]).then(([totalAttempts, correctAttempts]) => ({
          total: totalAttempts,
          correct: correctAttempts,
        })),
      ]);

      const correctRate =
        totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 1000) / 10 : 0;

      return {
        users: { total: totalUsers, teachers: teacherCount, students: studentCount },
        problems: { total: totalProblems, aiGenerated: aiGeneratedCount },
        textbooks: { total: totalTextbooks, chunks: totalChunks },
        attempts: { total: totalAttempts, correctRate },
      };
    } catch (error) {
      logger.error('애널리틱스 요약 조회 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('애널리틱스 요약 조회에 실패했습니다.');
    }
  }
}

export const analyticsService = new AnalyticsService();
