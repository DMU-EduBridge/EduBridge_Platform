import { prisma } from '@/lib/core/prisma';
import { CreateProblemSchema, ProblemQuerySchema } from '@/lib/validation/schemas';
import { z } from 'zod';

export class ProblemsService {
  async getProblems(query: z.infer<typeof ProblemQuerySchema>) {
    const {
      page,
      limit,
      subject,
      gradeLevel,
      difficulty,
      type,
      status,
      search,
      createdBy,
      creationType,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: status !== 'ARCHIVED',
      ...(subject && { subject }),
      ...(gradeLevel && { gradeLevel }),
      ...(difficulty && { difficulty }),
      ...(type && { type }),
      ...(createdBy && { createdBy }),
      ...(creationType && {
        isAIGenerated: creationType === 'ai' ? true : false,
      }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { content: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          reviewer: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.problem.count({ where }),
    ]);

    return {
      problems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      total,
    };
  }

  async createProblem(data: z.infer<typeof CreateProblemSchema>, userId: string) {
    const problem = await prisma.problem.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        content: data.content,
        type: data.type,
        difficulty: data.difficulty,
        subject: data.subject as any,
        gradeLevel: data.gradeLevel as any,
        options: data.options ?? null,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation ?? null,
        hints: data.hints ?? null,
        tags: data.tags ?? null,
        points: data.points,
        timeLimit: data.timeLimit ?? null,
        createdBy: userId,
        isActive: true,
        reviewStatus: 'PENDING',
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    return problem;
  }

  async getProblemMaterialMappings(problemIds: string[]) {
    const links = await prisma.learningMaterialProblem.findMany({
      where: { problemId: { in: problemIds } },
      select: { problemId: true, learningMaterialId: true },
    });

    const map = new Map(links.map((l) => [l.problemId, l.learningMaterialId] as const));
    return problemIds.map((id) => ({ problemId: id, studyId: map.get(id) || null }));
  }

  async getProblemStats() {
    const [totalCount, activeCount, totalAttempts, correctAttempts] = await Promise.all([
      prisma.problem.count(),
      prisma.problem.count({ where: { isActive: true } }),
      prisma.attempt.count(),
      prisma.attempt.count({ where: { isCorrect: true } }),
    ]);

    const averageAccuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    return {
      // 클라이언트가 기대하는 필드명으로 매핑
      totalProblems: totalCount,
      activeProblems: activeCount,
      totalAttempts,
      averageSuccessRate: Math.round(averageAccuracy),
      // 추가 필드들 (향후 확장용)
      weeklyChange: 0, // TODO: 주간 변화량 계산
      successRateChange: 0, // TODO: 정답률 변화량 계산
      attemptsChange: 0, // TODO: 시도수 변화량 계산
    };
  }
}

export const problemsService = new ProblemsService();
