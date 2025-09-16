import { prisma } from '@/lib/core/prisma';

export class AttemptRepository {
  async listByUserAndProblem(userId: string, problemId: string, limit: number) {
    return prisma.attempt.findMany({
      where: { userId, problemId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, selected: true, isCorrect: true, createdAt: true },
    });
  }

  async countRecentAttempts(userId: string, problemId: string, since: Date) {
    return prisma.attempt.count({
      where: { userId, problemId, createdAt: { gte: since } },
    });
  }

  async create(
    tx: typeof prisma,
    data: { userId: string; problemId: string; selected: string; isCorrect: boolean },
  ) {
    await tx.attempt.create({ data });
  }
}

export const attemptRepository = new AttemptRepository();
