import { serializeArray } from '@/lib/utils/json';
import type { Prisma } from '@prisma/client';
import { ProblemStatsSchema } from '../dto/problem-stats';
import { problemRepository } from '../repositories/problem.repository';

export class ProblemService {
  async list(params: {
    search?: string;
    subject?: string;
    difficulty?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.ProblemWhereInput = {};
    if (params.search)
      where.OR = [
        { title: { contains: params.search } },
        { description: { contains: params.search } },
      ];
    if (params.subject && params.subject !== 'all') where.subject = params.subject;
    if (params.difficulty && params.difficulty !== 'all') where.difficulty = params.difficulty;
    return problemRepository.findMany(where, params.page, params.limit);
  }

  async detail(id: string) {
    return problemRepository.findById(id);
  }

  async create(input: {
    title: string;
    description?: string;
    content: string;
    subject: string;
    type: string;
    difficulty: string;
    options?: string[];
    correctAnswer: string;
    hints?: string[];
    tags?: string[];
  }) {
    const data: Prisma.ProblemCreateInput = {
      title: input.title,
      description: input.description,
      content: input.content,
      subject: input.subject,
      type: input.type,
      difficulty: input.difficulty,
      options: serializeArray(input.options),
      correctAnswer: input.correctAnswer,
      hints: serializeArray(input.hints),
      tags: serializeArray(input.tags),
      isActive: true,
    };
    return problemRepository.create(data);
  }

  async update(
    id: string,
    input: {
      title: string;
      description: string;
      subject: string;
      type: string;
      difficulty: string;
      options?: string[];
      correctAnswer: string;
      hints?: string[];
      tags?: string[];
      isActive?: boolean;
    },
  ) {
    const data: Prisma.ProblemUpdateInput = {
      title: input.title,
      description: input.description,
      subject: input.subject,
      type: input.type,
      difficulty: input.difficulty,
      options: serializeArray(input.options),
      correctAnswer: input.correctAnswer,
      hints: serializeArray(input.hints),
      tags: serializeArray(input.tags),
      isActive: input.isActive,
    };
    return problemRepository.update(id, data);
  }

  async remove(id: string) {
    return problemRepository.delete(id);
  }

  async getStats() {
    const stats = await problemRepository.getStats();
    return ProblemStatsSchema.parse(stats);
  }
}

import { wrapService } from '@/lib/utils/service-metrics';
export const problemService = wrapService(new ProblemService(), 'ProblemService');
