import { prisma } from '@/lib/core/prisma';
import type { Prisma } from '@prisma/client';

export class StudentRepository {
  async findMany(where: Prisma.UserWhereInput, page: number, limit: number) {
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { preferences: true, progress: true },
      }),
      prisma.user.count({ where }),
    ]);
    return { items, total };
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data, include: { preferences: true } });
  }
}

export const studentRepository = new StudentRepository();
