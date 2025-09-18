import { prisma } from '@/lib/core/prisma';
import { parseJsonArray } from '@/lib/utils/json';
import type { Prisma } from '@prisma/client';

export class ProblemRepository {
  async findMany(where: Prisma.ProblemWhereInput, page: number, limit: number) {
    const [items, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.problem.count({ where }),
    ]);

    // JSON 문자열을 배열로 변환
    const transformedItems = items.map((item) => ({
      ...item,
      options: parseJsonArray(item.options),
      hints: parseJsonArray(item.hints),
      tags: parseJsonArray(item.tags),
    }));

    return { items: transformedItems, total };
  }

  async findById(id: string) {
    const item = await prisma.problem.findUnique({ where: { id } });
    if (!item) return null;

    // JSON 문자열을 배열로 변환
    return {
      ...item,
      options: parseJsonArray(item.options),
      hints: parseJsonArray(item.hints),
      tags: parseJsonArray(item.tags),
    };
  }

  async create(data: Prisma.ProblemCreateInput) {
    return prisma.problem.create({ data });
  }

  async update(id: string, data: Prisma.ProblemUpdateInput) {
    return prisma.problem.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.problem.delete({ where: { id } });
  }

  async getStats() {
    const [totalProblems, activeProblems, bySubject, byDifficulty] = await Promise.all([
      prisma.problem.count(),
      prisma.problem.count({ where: { isActive: true } }),
      prisma.problem.groupBy({
        by: ['subject'],
        _count: { subject: true },
      }),
      prisma.problem.groupBy({
        by: ['difficulty'],
        _count: { difficulty: true },
      }),
    ]);

    return {
      totalProblems,
      activeProblems,
      bySubject: bySubject.reduce(
        (acc, item) => {
          acc[item.subject] = item._count.subject;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byDifficulty: byDifficulty.reduce(
        (acc, item) => {
          acc[item.difficulty] = item._count.difficulty;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}

export const problemRepository = new ProblemRepository();
