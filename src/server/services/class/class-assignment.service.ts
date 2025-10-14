import { prisma } from '../../../lib/core/prisma';
import { logger } from '../../../lib/monitoring';
import type { ProblemAssignment } from '../../../types/domain/assignment';

type ProblemAssignmentQueryParams = {
  page?: number;
  limit?: number;
  classId?: string;
  problemId?: string;
  assignedBy?: string;
  isActive?: boolean;
  dueDate?: Date;
};

type CreateProblemAssignmentRequest = {
  classId: string;
  problemId: string;
  dueDate?: Date;
  instructions?: string;
  isActive?: boolean;
};

type UpdateProblemAssignmentRequest = {
  dueDate?: Date;
  instructions?: string;
  isActive?: boolean;
};

export class ClassAssignmentService {
  /**
   * 과제 목록 조회
   */
  async getProblemAssignments(params: ProblemAssignmentQueryParams = {}): Promise<{
    success: true;
    data: ProblemAssignment[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    try {
      const { page = 1, limit = 10, classId, problemId, assignedBy, isActive, dueDate } = params;

      const skip = (page - 1) * limit;
      const where: any = {};

      if (classId) where.classId = classId;
      if (problemId) where.problemId = problemId;
      if (assignedBy) where.assignedBy = assignedBy;
      if (isActive !== undefined) where.isActive = isActive;
      if (dueDate) where.dueDate = { gte: dueDate };

      const [assignments, total] = await Promise.all([
        prisma.problemAssignment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { assignedAt: 'desc' },
        }),
        prisma.problemAssignment.count({ where }),
      ]);

      return {
        success: true,
        data: assignments as unknown as ProblemAssignment[],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('과제 목록 조회 실패', undefined, {
        params,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('과제 목록 조회에 실패했습니다.');
    }
  }

  /**
   * 과제 상세 조회
   */
  async getProblemAssignmentById(id: string): Promise<ProblemAssignment | null> {
    try {
      const assignment = await prisma.problemAssignment.findUnique({ where: { id } });

      if (!assignment) return null;

      return assignment as unknown as ProblemAssignment;
    } catch (error) {
      logger.error('과제 조회 실패', undefined, {
        assignmentId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('과제 조회에 실패했습니다.');
    }
  }

  /**
   * 클래스에 문제 과제로 추가
   */
  async assignProblem(
    data: CreateProblemAssignmentRequest,
    assignedBy: string,
  ): Promise<ProblemAssignment> {
    try {
      // 중복 과제 확인
      const existingAssignment = await prisma.problemAssignment.findFirst({
        where: {
          classId: data.classId,
          // 배열 포함 여부는 스키마에 따라 다름: JSON 배열이면 array_contains 사용, Prisma Array이면 has 사용
          problemIds: { array_contains: [data.problemId] } as any,
        },
      });

      if (existingAssignment) {
        throw new Error('이미 과제로 등록된 문제입니다.');
      }

      const newAssignment = await prisma.problemAssignment.create({
        data: {
          title: 'Assignment',
          classId: data.classId,
          problemIds: [data.problemId],
          assignedBy,
          assignedAt: new Date(),
          dueDate: data.dueDate ?? null,
          instructions: data.instructions ?? null,
        },
      });

      logger.info('과제 추가 성공', {
        assignmentId: newAssignment.id,
        classId: data.classId,
        problemId: data.problemId,
      });
      return newAssignment as unknown as ProblemAssignment;
    } catch (error) {
      logger.error('과제 추가 실패', undefined, {
        data,
        assignedBy,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('과제 추가에 실패했습니다.');
    }
  }

  /**
   * 과제 정보 수정
   */
  async updateProblemAssignment(
    id: string,
    data: UpdateProblemAssignmentRequest,
  ): Promise<ProblemAssignment> {
    try {
      const existingAssignment = await prisma.problemAssignment.findUnique({ where: { id } });
      if (!existingAssignment) {
        throw new Error('과제를 찾을 수 없습니다.');
      }

      const updatedAssignment = await prisma.problemAssignment.update({
        where: { id },
        data: {
          ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
          ...(data.instructions !== undefined && { instructions: data.instructions }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });

      logger.info('과제 수정 성공', { assignmentId: id });
      return updatedAssignment as unknown as ProblemAssignment;
    } catch (error) {
      logger.error('과제 수정 실패', undefined, {
        assignmentId: id,
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('과제 수정에 실패했습니다.');
    }
  }

  /**
   * 과제 제거
   */
  async removeProblemAssignment(id: string): Promise<ProblemAssignment> {
    try {
      const existingAssignment = await prisma.problemAssignment.findUnique({ where: { id } });
      if (!existingAssignment) {
        throw new Error('과제를 찾을 수 없습니다.');
      }

      const removedAssignment = await prisma.problemAssignment.update({
        where: { id },
        data: { status: 'INACTIVE' as any },
      });

      logger.info('과제 제거 성공', { assignmentId: id });
      return removedAssignment as unknown as ProblemAssignment;
    } catch (error) {
      logger.error('과제 제거 실패', undefined, {
        assignmentId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('과제 제거에 실패했습니다.');
    }
  }
}
