import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import { AIProblem, checkAIServerHealth, fetchProblemsFromAI } from './client';

export class ProblemSyncService {
  /**
   * AI 서버에서 문제를 가져와서 로컬 데이터베이스에 동기화
   */
  async syncProblemsFromAI(params: {
    subject?: string;
    difficulty?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      // AI 서버 상태 확인
      const isHealthy = await checkAIServerHealth();
      if (!isHealthy) {
        throw new Error('AI 서버가 응답하지 않습니다');
      }

      // AI 서버에서 문제 가져오기
      const aiData = await fetchProblemsFromAI(params);

      logger.info('AI 서버에서 문제 가져오기 성공', {
        count: aiData.problems.length,
        batchId: aiData.batchId,
        source: aiData.source,
      });

      // 배치 처리로 문제 동기화
      const results = await this.batchSyncProblems(aiData.problems);

      return {
        success: true,
        synced: results.synced,
        updated: results.updated,
        skipped: results.skipped,
        errors: results.errors,
        batchId: aiData.batchId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      logger.error('AI 서버 문제 동기화 실패', undefined, { message: errorMessage });
      throw error;
    }
  }

  /**
   * 배치로 문제들을 동기화
   */
  private async batchSyncProblems(problems: AIProblem[]) {
    const results = {
      synced: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const problem of problems) {
      try {
        const result = await this.syncSingleProblem(problem);
        if (result === 'synced') results.synced++;
        else if (result === 'updated') results.updated++;
        else results.skipped++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        results.errors.push(`문제 ${problem.id}: ${errorMessage}`);
        logger.error('개별 문제 동기화 실패', undefined, {
          problemId: problem.id,
          message: errorMessage,
        });
      }
    }

    return results;
  }

  /**
   * 단일 문제 동기화
   */
  private async syncSingleProblem(aiProblem: AIProblem) {
    const existingProblem = await prisma.problem.findUnique({
      where: { id: aiProblem.id },
    });

    const problemData = {
      title: aiProblem.title,
      description: aiProblem.description || null,
      content: aiProblem.content,
      type: aiProblem.type,
      difficulty: aiProblem.difficulty === 'EXPERT' ? 'HARD' : (aiProblem.difficulty as any),
      subject: aiProblem.subject as any,
      options: aiProblem.options ? JSON.stringify(aiProblem.options) : null,
      correctAnswer: aiProblem.correctAnswer,
      explanation: aiProblem.explanation || null,
      hints: aiProblem.hints ? JSON.stringify(aiProblem.hints) : null,
      tags: aiProblem.tags ? JSON.stringify(aiProblem.tags) : null,
      points: aiProblem.points,
      timeLimit: aiProblem.timeLimit || null,
      isAIGenerated: true,
      qualityScore: aiProblem.qualityScore || null,
      reviewStatus: 'PENDING' as const,
      isActive: true,
    };

    if (existingProblem) {
      // 기존 문제 업데이트 (AI 생성 문제만)
      if (existingProblem.isAIGenerated) {
        await prisma.problem.update({
          where: { id: aiProblem.id },
          data: {
            ...problemData,
            type:
              problemData.type === 'CODING'
                ? ('MULTIPLE_CHOICE' as any)
                : problemData.type === 'MATH'
                  ? ('MULTIPLE_CHOICE' as any)
                  : (problemData.type as any),
            options: problemData.options ? JSON.parse(problemData.options) : null,
            hints: problemData.hints ? JSON.parse(problemData.hints) : null,
            tags: problemData.tags ? JSON.parse(problemData.tags) : null,
            updatedAt: new Date(),
          },
        });
        return 'updated';
      } else {
        // 수동 생성 문제는 건드리지 않음
        return 'skipped';
      }
    } else {
      // 새 문제 생성
      await prisma.problem.create({
        data: {
          id: aiProblem.id,
          ...problemData,
          type:
            problemData.type === 'CODING'
              ? ('MULTIPLE_CHOICE' as any)
              : problemData.type === 'MATH'
                ? ('MULTIPLE_CHOICE' as any)
                : (problemData.type as any),
          options: problemData.options ? JSON.parse(problemData.options) : null,
          hints: problemData.hints ? JSON.parse(problemData.hints) : null,
          tags: problemData.tags ? JSON.parse(problemData.tags) : null,
          isAIGenerated: true,
          aiGenerationId: aiProblem.id,
        },
      });
      return 'synced';
    }
  }

  /**
   * 특정 주제의 문제들을 동기화
   */
  async syncProblemsBySubject(subject: string, limit = 50) {
    return this.syncProblemsFromAI({
      subject,
      limit,
    });
  }

  /**
   * 특정 난이도의 문제들을 동기화
   */
  async syncProblemsByDifficulty(difficulty: string, limit = 50) {
    return this.syncProblemsFromAI({
      difficulty,
      limit,
    });
  }

  /**
   * 모든 문제 동기화 (주의: 대량 데이터 처리)
   */
  async syncAllProblems(batchSize = 100) {
    let offset = 0;
    let totalSynced = 0;
    let hasMore = true;

    while (hasMore) {
      const result = await this.syncProblemsFromAI({
        limit: batchSize,
        offset,
      });

      totalSynced += result.synced + result.updated;
      offset += batchSize;
      hasMore = result.synced + result.updated > 0;

      logger.info('배치 동기화 완료', {
        batch: Math.floor(offset / batchSize),
        synced: result.synced,
        updated: result.updated,
        totalSynced,
      });

      // 너무 많은 요청을 방지하기 위해 잠시 대기
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return { totalSynced };
  }

  /**
   * AI 서버 상태 모니터링
   */
  async getAIServerStatus() {
    const isHealthy = await checkAIServerHealth();
    const problemCount = await prisma.problem.count({
      where: { isAIGenerated: true },
    });

    return {
      isHealthy,
      aiProblemCount: problemCount,
      lastChecked: new Date(),
    };
  }
}
