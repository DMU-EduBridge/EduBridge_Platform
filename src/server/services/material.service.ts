import { serializeArray } from '@/lib/utils/json';
import type { Prisma } from '@prisma/client';
import { materialRepository } from '../repositories/material.repository';

export class MaterialService {
  async list(params: {
    search?: string;
    subject?: string;
    status?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.LearningMaterialWhereInput = {};
    if (params.search)
      where.OR = [
        { title: { contains: params.search } },
        { description: { contains: params.search } },
      ];
    if (params.subject && params.subject !== 'all') where.subject = params.subject;
    if (params.status && params.status !== 'all') where.status = params.status;
    return materialRepository.findMany(where, params.page, params.limit);
  }

  async create(input: {
    title: string;
    description?: string;
    subject: string;
    difficulty: string;
    estimatedTime?: number;
    content: string;
    files?: string[];
    status?: string;
  }) {
    const data: Prisma.LearningMaterialCreateInput = {
      title: input.title,
      description: input.description,
      subject: input.subject,
      difficulty: input.difficulty,
      estimatedTime: input.estimatedTime ?? 0,
      content: input.content,
      files: serializeArray(input.files as string[]),
      status: input.status ?? 'DRAFT',
      isActive: true,
    };
    return materialRepository.create(data);
  }
}

import { wrapService } from '@/lib/utils/service-metrics';
export const materialService = wrapService(new MaterialService(), 'MaterialService');
