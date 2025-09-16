import { prisma } from '@/lib/core/prisma';
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
    return { items, total };
  }

  async findById(id: string) {
    return prisma.problem.findUnique({ where: { id } });
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
}

export const problemRepository = new ProblemRepository();
