import { prisma } from '@/lib/core/prisma';
import { attemptRepository } from '../repositories/attempt.repository';

export class AttemptService {
  async list(userId: string, problemId: string, limit: number) {
    return attemptRepository.listByUserAndProblem(userId, problemId, limit);
  }

  async create(userId: string, problemId: string, selected: string) {
    return prisma.$transaction(async (tx) => {
      const problem = await tx.problem.findUnique({
        where: { id: problemId },
        select: { id: true, correctAnswer: true },
      });
      if (!problem) return { created: false, notFound: true as const };
      const isCorrect = selected.trim() === problem.correctAnswer;
      await attemptRepository.create(tx as any, {
        userId,
        problemId: problem.id,
        selected,
        isCorrect,
      });
      return { created: true, isCorrect } as const;
    });
  }

  async isRateLimited(userId: string, problemId: string) {
    const since = new Date(Date.now() - 60 * 1000);
    const recent = await attemptRepository.countRecentAttempts(userId, problemId, since);
    return recent >= 5;
  }

  async hasAttempt(userId: string, problemId: string): Promise<boolean> {
    const since = new Date(0);
    const count = await attemptRepository.countRecentAttempts(userId, problemId, since);
    return count > 0;
  }
}

import { wrapService } from '@/lib/utils/service-metrics';
export const attemptService = wrapService(new AttemptService(), 'AttemptService');
