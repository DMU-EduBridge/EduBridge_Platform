import { prisma } from '@/lib/core/prisma';
import { ProblemBatchSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

export class ProblemBatchService {
  async createProblems(data: z.infer<typeof ProblemBatchSchema>) {
    // 데이터베이스에 문제들 일괄 생성

    // 생성된 문제들 조회
    const savedProblems = await prisma.problem.findMany({
      where: {
        title: {
          in: data.map((problem) => problem.title),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: data.length,
    });

    return savedProblems;
  }
}

export const problemBatchService = new ProblemBatchService();
