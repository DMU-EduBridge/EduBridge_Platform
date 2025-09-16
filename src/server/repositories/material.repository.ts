import { prisma } from '@/lib/core/prisma';
import type { Prisma } from '@prisma/client';

export class MaterialRepository {
  async findMany(where: Prisma.LearningMaterialWhereInput, page: number, limit: number) {
    const [items, total] = await Promise.all([
      prisma.learningMaterial.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.learningMaterial.count({ where }),
    ]);
    return { items, total };
  }

  async create(data: Prisma.LearningMaterialCreateInput) {
    return prisma.learningMaterial.create({ data });
  }
}

export const materialRepository = new MaterialRepository();
