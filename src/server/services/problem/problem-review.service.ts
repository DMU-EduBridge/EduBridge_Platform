import { Prisma, Problem } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '../../../lib/core/prisma';
import { handlePrismaError } from '../../../lib/errors';
import { logger } from '../../../lib/monitoring';
import { executeProblemTransaction } from '../../../lib/transactions';

export class ProblemReviewService {
  /**
   * 문제 승인
   */
  async approveProblem(problemId: string, reviewerId: string): Promise<Problem> {
    try {
      return await executeProblemTransaction(async (tx) => {
        const problem = await tx.problem.update({
          where: { id: problemId },
          data: {
            status: 'PUBLISHED',
            reviewStatus: 'APPROVED',
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
            updatedAt: new Date(),
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        logger.info('문제 승인 성공', { problemId, reviewerId });
        return problem;
      });
    } catch (error) {
      logger.error('문제 승인 실패', undefined, {
        problemId,
        reviewerId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error as PrismaClientKnownRequestError);
    }
  }

  /**
   * 문제 거부
   */
  async rejectProblem(problemId: string, reviewerId: string, reason?: string): Promise<Problem> {
    try {
      return await executeProblemTransaction(async (tx) => {
        const problem = await tx.problem.update({
          where: { id: problemId },
          data: {
            status: 'DRAFT',
            reviewStatus: 'REJECTED',
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
            generationPrompt: reason || null,
            updatedAt: new Date(),
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        logger.info('문제 거부 성공', { problemId, reviewerId, reason });
        return problem;
      });
    } catch (error) {
      logger.error('문제 거부 실패', undefined, {
        problemId,
        reviewerId,
        reason,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error as PrismaClientKnownRequestError);
    }
  }

  /**
   * 검토 대기 중인 문제 목록
   */
  async getPendingReviewProblems(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ problems: Problem[]; total: number; pagination: any }> {
    try {
      const skip = (page - 1) * limit;

      const [problems, total] = await Promise.all([
        prisma.problem.findMany({
          where: {
            reviewStatus: 'PENDING',
            status: 'DRAFT',
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'asc' },
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
        }),
        prisma.problem.count({
          where: {
            reviewStatus: 'PENDING',
            status: 'DRAFT',
          },
        }),
      ]);

      const pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      };

      logger.info('검토 대기 문제 목록 조회 성공', { total });
      return { problems, total, pagination };
    } catch (error) {
      logger.error('검토 대기 문제 목록 조회 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error as PrismaClientKnownRequestError);
    }
  }

  /**
   * 검토 완료된 문제 목록
   */
  async getReviewedProblems(
    reviewerId?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ problems: Problem[]; total: number; pagination: any }> {
    try {
      const skip = (page - 1) * limit;

      const where: Prisma.ProblemWhereInput = {
        reviewStatus: { in: ['APPROVED', 'REJECTED'] },
        ...(reviewerId && { reviewedBy: reviewerId }),
      };

      const [problems, total] = await Promise.all([
        prisma.problem.findMany({
          where,
          skip,
          take: limit,
          orderBy: { reviewedAt: 'desc' },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                // attempts: true, // 제거됨
              },
            },
          },
        }),
        prisma.problem.count({ where }),
      ]);

      const pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      };

      logger.info('검토 완료 문제 목록 조회 성공', { reviewerId, total });
      return { problems, total, pagination };
    } catch (error) {
      logger.error('검토 완료 문제 목록 조회 실패', undefined, {
        reviewerId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error as PrismaClientKnownRequestError);
    }
  }

  /**
   * 검토 통계
   */
  async getReviewStats(reviewerId?: string): Promise<any> {
    try {
      const where: Prisma.ProblemWhereInput = {
        ...(reviewerId && { reviewedBy: reviewerId }),
      };

      const [totalReviewed, approved, rejected, pending, _averageReviewTime] = await Promise.all([
        prisma.problem.count({
          where: {
            ...where,
            reviewStatus: { in: ['APPROVED', 'REJECTED'] },
          },
        }),
        prisma.problem.count({
          where: {
            ...where,
            reviewStatus: 'APPROVED',
          },
        }),
        prisma.problem.count({
          where: {
            ...where,
            reviewStatus: 'REJECTED',
          },
        }),
        prisma.problem.count({
          where: {
            reviewStatus: 'PENDING',
            status: 'DRAFT',
          },
        }),
        prisma.problem.aggregate({
          where: {
            ...where,
            reviewStatus: { in: ['APPROVED', 'REJECTED'] },
            reviewedAt: { not: null },
            createdAt: { not: null as any },
          },
          _avg: {
            // Prisma에서는 직접 날짜 차이 계산이 어려우므로 별도 처리 필요
          },
        }),
      ]);

      const approvalRate = totalReviewed > 0 ? (approved / totalReviewed) * 100 : 0;

      return {
        totalReviewed,
        approved,
        rejected,
        pending,
        approvalRate: Math.round(approvalRate * 100) / 100,
        averageReviewTime: 0, // 별도 계산 필요
      };
    } catch (error) {
      logger.error('검토 통계 조회 실패', undefined, {
        reviewerId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error as PrismaClientKnownRequestError);
    }
  }

  /**
   * 문제 재검토 요청
   */
  async requestReReview(problemId: string, requesterId: string): Promise<Problem> {
    try {
      const problem = await prisma.problem.update({
        where: { id: problemId },
        data: {
          reviewStatus: 'PENDING',
          status: 'DRAFT',
          generationPrompt: null, // reviewNotes 대신 generationPrompt 사용
          reviewedBy: null,
          reviewedAt: null,
          updatedAt: new Date(),
        },
      });

      logger.info('재검토 요청 성공', { problemId, requesterId });
      return problem;
    } catch (error) {
      logger.error('재검토 요청 실패', undefined, {
        problemId,
        requesterId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error as PrismaClientKnownRequestError);
    }
  }

  /**
   * 검토 노트 추가
   */
  async addReviewNotes(problemId: string, reviewerId: string, notes: string): Promise<Problem> {
    try {
      const problem = await prisma.problem.update({
        where: { id: problemId },
        data: {
          generationPrompt: notes, // reviewNotes 대신 generationPrompt 사용
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('검토 노트 추가 성공', { problemId, reviewerId });
      return problem;
    } catch (error) {
      logger.error('검토 노트 추가 실패', undefined, {
        problemId,
        reviewerId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error as PrismaClientKnownRequestError);
    }
  }
}
