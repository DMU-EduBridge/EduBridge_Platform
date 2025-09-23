import { prisma } from '@/lib/core/prisma';
import { Prisma, Problem } from '@prisma/client';
import {
  CreateProblemDtoType,
  ProblemListQueryDtoType,
  UpdateProblemDtoType,
} from '../dto/problem';

export class ProblemRepository {
  async findById(id: string): Promise<Problem | null> {
    return prisma.problem.findUnique({
      where: { id, deletedAt: null },
      include: {
        creator: true,
        reviewer: true,
        textbook: true,
        questionOptions: true,
        questionTags: true,
        attempts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: true },
        },
      },
    });
  }

  async findMany(query: ProblemListQueryDtoType): Promise<{ problems: Problem[]; total: number }> {
    const {
      page,
      limit,
      subject,
      gradeLevel,
      difficulty,
      type,
      textbookId,
      isAIGenerated,
      reviewStatus,
      search,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProblemWhereInput = {
      deletedAt: null,
      isActive: true,
    };

    if (subject) where.subject = subject;
    if (gradeLevel) where.gradeLevel = gradeLevel;
    if (difficulty) where.difficulty = difficulty;
    if (type) where.type = type;
    if (textbookId) where.textbookId = textbookId;
    if (isAIGenerated !== undefined) where.isAIGenerated = isAIGenerated;
    if (reviewStatus) where.reviewStatus = reviewStatus;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: true,
          reviewer: true,
          textbook: true,
          questionOptions: true,
          questionTags: true,
          _count: {
            select: {
              attempts: true,
            },
          },
        },
      }),
      prisma.problem.count({ where }),
    ]);

    return { problems, total };
  }

  async create(data: CreateProblemDtoType, createdBy: string): Promise<Problem> {
    return prisma.problem.create({
      data: {
        ...data,
        createdBy,
        isAIGenerated: false,
        reviewStatus: 'PENDING',
      },
      include: {
        creator: true,
        textbook: true,
        questionOptions: true,
        questionTags: true,
      },
    });
  }

  async update(id: string, data: UpdateProblemDtoType): Promise<Problem> {
    return prisma.problem.update({
      where: { id },
      data,
      include: {
        creator: true,
        reviewer: true,
        textbook: true,
        questionOptions: true,
        questionTags: true,
      },
    });
  }

  async softDelete(id: string): Promise<Problem> {
    return prisma.problem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getStats(): Promise<{
    totalProblems: number;
    activeProblems: number;
    bySubject: Record<string, number>;
    byDifficulty: Record<string, number>;
    byType: Record<string, number>;
    aiGeneratedCount: number;
  }> {
    const [totalProblems, activeProblems, bySubject, byDifficulty, byType, aiGeneratedCount] =
      await Promise.all([
        prisma.problem.count({ where: { deletedAt: null } }),
        prisma.problem.count({ where: { isActive: true, deletedAt: null } }),
        prisma.problem.groupBy({
          by: ['subject'],
          _count: { subject: true },
          where: { deletedAt: null },
        }),
        prisma.problem.groupBy({
          by: ['difficulty'],
          _count: { difficulty: true },
          where: { deletedAt: null },
        }),
        prisma.problem.groupBy({
          by: ['type'],
          _count: { type: true },
          where: { deletedAt: null },
        }),
        prisma.problem.count({
          where: {
            isAIGenerated: true,
            deletedAt: null,
          },
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
      byType: byType.reduce(
        (acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        },
        {} as Record<string, number>,
      ),
      aiGeneratedCount,
    };
  }

  async findByCreator(
    createdBy: string,
    query: Omit<ProblemListQueryDtoType, 'page' | 'limit'>,
  ): Promise<Problem[]> {
    const where: Prisma.ProblemWhereInput = {
      createdBy,
      deletedAt: null,
    };

    if (query.subject) where.subject = query.subject;
    if (query.difficulty) where.difficulty = query.difficulty;
    if (query.type) where.type = query.type;
    if (query.reviewStatus) where.reviewStatus = query.reviewStatus;

    return prisma.problem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        textbook: true,
        questionOptions: true,
        questionTags: true,
      },
    });
  }

  async updateReviewStatus(
    id: string,
    reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION',
    reviewedBy: string,
  ): Promise<Problem> {
    return prisma.problem.update({
      where: { id },
      data: {
        reviewStatus,
        reviewedBy,
        reviewedAt: new Date(),
      },
      include: {
        reviewer: true,
      },
    });
  }

  async findPendingReview(): Promise<Problem[]> {
    return prisma.problem.findMany({
      where: {
        reviewStatus: 'PENDING',
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        creator: true,
        textbook: true,
      },
    });
  }
}
