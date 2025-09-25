import { Prisma, Problem } from '@prisma/client';
import { prisma } from '../../../lib/core/prisma';
import { handlePrismaError } from '../../../lib/errors';
import { logger } from '../../../lib/monitoring';
import { executeProblemTransaction } from '../../../lib/transactions';
import {
  CreateProblemSchema,
  UpdateProblemSchema,
  validateWithSchema,
} from '../../../lib/validation';
import { CreateProblemRequest, UpdateProblemRequest } from '../../../types/domain/problem';

export class ProblemCrudService {
  /**
   * 문제 상세 조회
   */
  async getProblemById(id: string): Promise<Problem | null> {
    try {
      return await prisma.problem.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          attempts: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      logger.error('문제 조회 실패', undefined, {
        problemId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error);
    }
  }

  /**
   * 문제 생성
   */
  async createProblem(data: CreateProblemRequest, createdBy: string): Promise<Problem> {
    try {
      // 입력 검증
      const validatedData = validateWithSchema(CreateProblemSchema, data) as {
        title: string;
        description?: string | null;
        content: string;
        type: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY' | 'TRUE_FALSE' | 'CODING' | 'MATH';
        difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
        subject: string;
        gradeLevel?: string | null;
        unit?: string | null;
        options?: string[];
        correctAnswer: string;
        explanation?: string | null;
        hints?: string[];
        tags?: string[];
        isActive?: boolean;
        isAIGenerated?: boolean;
        reviewStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
      };

      return await executeProblemTransaction(async (tx) => {
        // 문제 생성
        const problem = await tx.problem.create({
          data: {
            title: validatedData.title,
            description: validatedData.description || null,
            content: validatedData.content,
            type: validatedData.type,
            difficulty: validatedData.difficulty,
            subject: validatedData.subject,
            gradeLevel: validatedData.gradeLevel || null,
            unit: validatedData.unit || null,
            options: validatedData.options
              ? JSON.stringify(validatedData.options)
              : Prisma.JsonNull,
            correctAnswer: validatedData.correctAnswer || '',
            explanation: validatedData.explanation || null,
            hints: validatedData.hints ? JSON.stringify(validatedData.hints) : Prisma.JsonNull,
            tags: validatedData.tags ? JSON.stringify(validatedData.tags) : Prisma.JsonNull,
            isAIGenerated: validatedData.isAIGenerated || false,
            reviewStatus: validatedData.reviewStatus || 'PENDING',
            createdBy,
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        });

        // 통계 업데이트 (선택사항)
        await tx.user.update({
          where: { id: createdBy },
          data: {
            updatedAt: new Date(),
          },
        });

        logger.info('문제 생성 성공', { problemId: problem.id, createdBy });
        return problem;
      });
    } catch (error) {
      logger.error('문제 생성 실패', undefined, {
        data,
        createdBy,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error);
    }
  }

  /**
   * 문제 수정
   */
  async updateProblem(id: string, data: UpdateProblemRequest): Promise<Problem> {
    try {
      // 입력 검증
      const validatedData = validateWithSchema(UpdateProblemSchema, data) as {
        title?: string;
        description?: string | null;
        content?: string;
        type?: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY' | 'TRUE_FALSE' | 'CODING' | 'MATH';
        difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
        subject?: string;
        gradeLevel?: string | null;
        unit?: string | null;
        options?: string[];
        correctAnswer?: string;
        explanation?: string | null;
        hints?: string[];
        tags?: string[];
        isActive?: boolean;
        isAIGenerated?: boolean;
        reviewStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
      };

      const existingProblem = await prisma.problem.findUnique({ where: { id } });
      if (!existingProblem) {
        throw new Error('문제를 찾을 수 없습니다.');
      }

      // 업데이트할 데이터 구성
      const updateData: any = {};

      if (validatedData.title) updateData.title = validatedData.title;
      if (validatedData.description !== undefined)
        updateData.description = validatedData.description || null;
      if (validatedData.content) updateData.content = validatedData.content;
      if (validatedData.type) updateData.type = validatedData.type;
      if (validatedData.difficulty) updateData.difficulty = validatedData.difficulty;
      if (validatedData.subject) updateData.subject = validatedData.subject;
      if (validatedData.gradeLevel !== undefined)
        updateData.gradeLevel = validatedData.gradeLevel || null;
      if (validatedData.unit !== undefined) updateData.unit = validatedData.unit || null;
      if (validatedData.options !== undefined) {
        updateData.options = validatedData.options
          ? JSON.stringify(validatedData.options)
          : Prisma.JsonNull;
      }
      if (validatedData.correctAnswer) updateData.correctAnswer = validatedData.correctAnswer;
      if (validatedData.explanation !== undefined)
        updateData.explanation = validatedData.explanation || null;
      if (validatedData.hints !== undefined) {
        updateData.hints = validatedData.hints
          ? JSON.stringify(validatedData.hints)
          : Prisma.JsonNull;
      }
      if (validatedData.tags !== undefined) {
        updateData.tags = validatedData.tags ? JSON.stringify(validatedData.tags) : Prisma.JsonNull;
      }
      if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
      if (validatedData.isAIGenerated !== undefined)
        updateData.isAIGenerated = validatedData.isAIGenerated;
      if (validatedData.reviewStatus !== undefined)
        updateData.reviewStatus = validatedData.reviewStatus;

      const updatedProblem = await prisma.problem.update({
        where: { id },
        data: updateData,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      logger.info('문제 수정 성공', { problemId: id });
      return updatedProblem;
    } catch (error) {
      logger.error('문제 수정 실패', undefined, {
        problemId: id,
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error);
    }
  }

  /**
   * 문제 삭제 (soft delete)
   */
  async deleteProblem(id: string): Promise<Problem> {
    try {
      const existingProblem = await prisma.problem.findUnique({ where: { id } });
      if (!existingProblem) {
        throw new Error('문제를 찾을 수 없습니다.');
      }

      const deletedProblem = await prisma.problem.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      logger.info('문제 삭제 성공', { problemId: id });
      return deletedProblem;
    } catch (error) {
      logger.error('문제 삭제 실패', undefined, {
        problemId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error);
    }
  }

  /**
   * 문제 복원
   */
  async restoreProblem(id: string): Promise<Problem> {
    try {
      const restoredProblem = await prisma.problem.update({
        where: { id },
        data: {
          isActive: true,
          updatedAt: new Date(),
        },
      });

      logger.info('문제 복원 성공', { problemId: id });
      return restoredProblem;
    } catch (error) {
      logger.error('문제 복원 실패', undefined, {
        problemId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw handlePrismaError(error);
    }
  }
}
