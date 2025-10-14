import { Prisma, Problem, ProblemDifficulty, ProblemType } from '@prisma/client';
import { prisma } from '../../../lib/core/prisma';
import { handlePrismaError } from '../../../lib/errors';
import { logger } from '../../../lib/monitoring';
import {
  getOptimizedInclude,
  measureQueryTime,
  optimizePagination,
  optimizeWhereClause,
} from '../../../lib/performance/query-optimizer';
import { ProblemQuerySchema, validateWithSchema } from '../../../lib/validation';
import { ProblemQueryParams } from '../../../types/domain/problem';

export class ProblemSearchService {
  /**
   * 문제 목록 조회 (검색 및 필터링)
   */
  async getProblems(
    query: ProblemQueryParams,
  ): Promise<{ problems: Problem[]; total: number; pagination: any }> {
    try {
      // 입력 검증
      const validatedQuery = validateWithSchema(ProblemQuerySchema, query);

      const {
        page = 1,
        limit = 10,
        search,
        difficulty,
        type,
        status,
        subject,
        gradeLevel,
        createdBy,
      } = validatedQuery;

      // 페이지네이션 최적화
      const {
        page: optimizedPage,
        limit: optimizedLimit,
        skip,
      } = optimizePagination({
        page,
        limit,
        maxLimit: 100,
      });

      // WHERE 조건 최적화
      const where = optimizeWhereClause({
        ...(search && {
          OR: [{ title: { contains: search } }, { content: { contains: search } }],
        }),
        difficulty,
        type,
        status,
        ...(subject ? { subject: subject as any } : {}),
        gradeLevel,
        createdBy,
      });

      // 관계 데이터 로딩 최적화
      const include = getOptimizedInclude({
        includeCreator: true,
        includeStats: true,
      });

      const [problems, total] = await measureQueryTime('getProblems', () =>
        Promise.all([
          prisma.problem.findMany({
            where,
            skip,
            take: optimizedLimit,
            orderBy: { createdAt: 'desc' },
            include,
          }),
          prisma.problem.count({ where }),
        ]),
      );

      const pagination = {
        page: optimizedPage,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      };

      logger.info('문제 목록 조회 성공', { query, total });
      return { problems, total, pagination };
    } catch (error) {
      logger.error('문제 목록 조회 실패', undefined, {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error as Prisma.PrismaClientKnownRequestError);
    }
  }

  /**
   * 문제 검색 (전문 검색)
   */
  async searchProblems(
    searchTerm: string,
    filters?: {
      subject?: string;
      gradeLevel?: string;
      difficulty?: ProblemDifficulty;
      type?: ProblemType;
      limit?: number;
    },
  ): Promise<Problem[]> {
    try {
      const limit = filters?.limit || 20;

      const where: Prisma.ProblemWhereInput = {
        status: 'PUBLISHED', // 공개된 문제만 검색
        OR: [
          { title: { contains: searchTerm } },
          { content: { contains: searchTerm } },
          { tags: { string_contains: searchTerm } },
        ],
        ...(filters?.subject && { subject: filters.subject as any }),
        ...(filters?.gradeLevel && { gradeLevel: filters.gradeLevel as any }),
        ...(filters?.difficulty && { difficulty: filters.difficulty }),
        ...(filters?.type && { type: filters.type }),
      };

      const problems = await prisma.problem.findMany({
        where,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {},
          },
        },
      });

      logger.info('문제 검색 성공', { searchTerm, filters, count: problems.length });
      return problems;
    } catch (error) {
      logger.error('문제 검색 실패', undefined, {
        searchTerm,
        filters,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error as Prisma.PrismaClientKnownRequestError);
    }
  }

  /**
   * 추천 문제 조회
   */
  async getRecommendedProblems(userId: string, limit: number = 10): Promise<Problem[]> {
    try {
      // 사용자의 과목과 학년 정보 가져오기
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          subject: true,
          gradeLevel: true,
        },
      });

      if (!user) {
        return [];
      }

      // 사용자가 아직 시도하지 않은 문제들 중에서 추천
      const attemptedProblemIds = await prisma.attempt.findMany({
        where: { userId },
        select: { problemId: true },
        distinct: ['problemId'],
      });

      const attemptedIds = attemptedProblemIds.map((a) => a.problemId);

      const where: Prisma.ProblemWhereInput = {
        status: 'PUBLISHED',
        id: { notIn: attemptedIds },
        ...(user.subject && { subject: user.subject as any }),
        ...(user.gradeLevel && { gradeLevel: user.gradeLevel as any }),
      };

      const problems = await prisma.problem.findMany({
        where,
        take: limit,
        orderBy: [
          { difficulty: 'asc' }, // 쉬운 문제부터
          { createdAt: 'desc' },
        ],
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              // attempts: true, // 제거됨
            },
          },
        },
      });

      logger.info('추천 문제 조회 성공', { userId, count: problems.length });
      return problems;
    } catch (error) {
      logger.error('추천 문제 조회 실패', undefined, {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error as Prisma.PrismaClientKnownRequestError);
    }
  }

  /**
   * 인기 문제 조회
   */
  async getPopularProblems(
    limit: number = 10,
    period: 'day' | 'week' | 'month' = 'week',
  ): Promise<Problem[]> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const problems = await prisma.problem.findMany({
        where: {
          status: 'PUBLISHED',
          attempts: {
            some: {
              createdAt: {
                gte: startDate,
              },
            },
          },
        },
        take: limit,
        orderBy: [
          {
            attempts: {
              _count: 'desc',
            },
          },
        ],
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              // attempts: true, // 제거됨
            },
          },
        },
      });

      logger.info('인기 문제 조회 성공', { period, count: problems.length });
      return problems;
    } catch (error) {
      logger.error('인기 문제 조회 실패', undefined, {
        period,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error as Prisma.PrismaClientKnownRequestError);
    }
  }

  /**
   * 필터 옵션 조회
   */
  async getFilterOptions(): Promise<any> {
    try {
      const [subjects, gradeLevels, difficulties, types] = await Promise.all([
        prisma.problem.findMany({
          select: { subject: true },
          distinct: ['subject'],
          where: { status: 'PUBLISHED' },
        }),
        prisma.problem.findMany({
          select: { gradeLevel: true },
          distinct: ['gradeLevel'],
          where: { status: 'PUBLISHED', gradeLevel: { not: null } },
        }),
        prisma.problem.findMany({
          select: { difficulty: true },
          distinct: ['difficulty'],
          where: { status: 'PUBLISHED' },
        }),
        prisma.problem.findMany({
          select: { type: true },
          distinct: ['type'],
          where: { status: 'PUBLISHED' },
        }),
      ]);

      return {
        subjects: subjects.map((s) => s.subject).filter(Boolean),
        gradeLevels: gradeLevels.map((g) => g.gradeLevel).filter(Boolean),
        difficulties: difficulties.map((d) => d.difficulty),
        types: types.map((t) => t.type),
      };
    } catch (error) {
      logger.error('필터 옵션 조회 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error as Prisma.PrismaClientKnownRequestError);
    }
  }
}
