import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/logger';
import {
  AssignmentFilters,
  AssignmentStats,
  CreateAssignmentRequest,
  ProblemAssignment,
  UpdateAssignmentRequest,
} from '@/types/domain/assignment';
import { AssignmentStatus } from '@prisma/client';

export class AssignmentService {
  /**
   * 배정 목록 조회
   */
  async getAssignments(
    teacherId: string,
    filters: AssignmentFilters = {},
  ): Promise<ProblemAssignment[]> {
    try {
      const whereClause: any = {
        assignedBy: teacherId,
      };

      if (filters.classId) {
        whereClause.classId = filters.classId;
      }
      if (filters.studentId) {
        whereClause.studentId = filters.studentId;
      }
      if (filters.assignmentType) {
        whereClause.assignmentType = filters.assignmentType;
      }
      if (filters.status) {
        whereClause.status = filters.status;
      }
      if (filters.startDate || filters.endDate) {
        whereClause.assignedAt = {};
        if (filters.startDate) whereClause.assignedAt.gte = filters.startDate;
        if (filters.endDate) whereClause.assignedAt.lte = filters.endDate;
      }

      const assignments = await prisma.problemAssignment.findMany({
        where: whereClause,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              subject: true,
              gradeLevel: true,
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assigner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          assignedAt: 'desc',
        },
      });

      // Fetch problems for each assignment
      const assignmentsWithProblems = await Promise.all(
        assignments.map(async (assignment) => {
          const problemIds = assignment.problemIds as string[];
          const problems = await prisma.problem.findMany({
            where: {
              id: {
                in: problemIds,
              },
            },
            select: {
              id: true,
              title: true,
              subject: true,
              difficulty: true,
            },
          });

          return {
            ...assignment,
            problems,
          } as ProblemAssignment;
        }),
      );

      return assignmentsWithProblems;
    } catch (error) {
      logger.error('Failed to get assignments', { teacherId, filters, error });
      throw new Error('배정 목록을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 특정 배정 조회
   */
  async getAssignmentById(
    assignmentId: string,
    teacherId: string,
  ): Promise<ProblemAssignment | null> {
    try {
      const assignment = await prisma.problemAssignment.findFirst({
        where: {
          id: assignmentId,
          assignedBy: teacherId,
        },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              subject: true,
              gradeLevel: true,
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assigner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!assignment) {
        return null;
      }

      // Fetch problems
      const problemIds = assignment.problemIds as string[];
      const problems = await prisma.problem.findMany({
        where: {
          id: {
            in: problemIds,
          },
        },
        select: {
          id: true,
          title: true,
          subject: true,
          difficulty: true,
        },
      });

      return {
        ...assignment,
        problems,
      } as ProblemAssignment;
    } catch (error) {
      logger.error('Failed to get assignment by id', { assignmentId, teacherId, error });
      throw new Error('배정을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 새 배정 생성
   */
  async createAssignment(
    data: CreateAssignmentRequest,
    teacherId: string,
  ): Promise<ProblemAssignment> {
    try {
      // 권한 확인
      if (data.classId) {
        const hasPermission = await prisma.class.findFirst({
          where: {
            id: data.classId,
            OR: [
              { createdBy: teacherId },
              {
                members: {
                  some: {
                    userId: teacherId,
                    role: 'TEACHER',
                    isActive: true,
                  },
                },
              },
            ],
            deletedAt: null,
          },
        });

        if (!hasPermission) {
          throw new Error('해당 클래스에 대한 권한이 없습니다.');
        }
      }

      if (data.studentId) {
        const student = await prisma.user.findFirst({
          where: {
            id: data.studentId,
            role: 'STUDENT',
          },
        });

        if (!student) {
          throw new Error('해당 학생을 찾을 수 없습니다.');
        }
      }

      // 문제 존재 확인
      const problems = await prisma.problem.findMany({
        where: {
          id: {
            in: data.problemIds,
          },
        },
      });

      if (problems.length !== data.problemIds.length) {
        throw new Error('일부 문제를 찾을 수 없습니다.');
      }

      const assignment = await prisma.problemAssignment.create({
        data: {
          title: data.title,
          description: data.description,
          assignmentType: data.assignmentType,
          status: AssignmentStatus.DRAFT,
          classId: data.classId,
          studentId: data.studentId,
          problemIds: data.problemIds,
          dueDate: data.dueDate,
          instructions: data.instructions,
          metadata: data.metadata,
          assignedBy: teacherId,
        },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              subject: true,
              gradeLevel: true,
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assigner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Fetch problems
      const problemsForAssignment = await prisma.problem.findMany({
        where: {
          id: {
            in: data.problemIds,
          },
        },
        select: {
          id: true,
          title: true,
          subject: true,
          difficulty: true,
        },
      });

      return {
        ...assignment,
        problems: problemsForAssignment,
      } as ProblemAssignment;
    } catch (error) {
      logger.error('Failed to create assignment', { data, teacherId, error });
      throw new Error('배정 생성에 실패했습니다.');
    }
  }

  /**
   * 배정 수정
   */
  async updateAssignment(
    assignmentId: string,
    data: UpdateAssignmentRequest,
    teacherId: string,
  ): Promise<ProblemAssignment> {
    try {
      // 권한 확인
      const existingAssignment = await prisma.problemAssignment.findFirst({
        where: {
          id: assignmentId,
          assignedBy: teacherId,
        },
      });

      if (!existingAssignment) {
        throw new Error('배정을 수정할 권한이 없습니다.');
      }

      const assignment = await prisma.problemAssignment.update({
        where: { id: assignmentId },
        data,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              subject: true,
              gradeLevel: true,
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assigner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Fetch problems
      const problemIds = assignment.problemIds as string[];
      const problems = await prisma.problem.findMany({
        where: {
          id: {
            in: problemIds,
          },
        },
        select: {
          id: true,
          title: true,
          subject: true,
          difficulty: true,
        },
      });

      return {
        ...assignment,
        problems,
      } as ProblemAssignment;
    } catch (error) {
      logger.error('Failed to update assignment', { assignmentId, data, teacherId, error });
      throw new Error('배정 수정에 실패했습니다.');
    }
  }

  /**
   * 배정 삭제
   */
  async deleteAssignment(assignmentId: string, teacherId: string): Promise<void> {
    try {
      // 권한 확인
      const existingAssignment = await prisma.problemAssignment.findFirst({
        where: {
          id: assignmentId,
          assignedBy: teacherId,
        },
      });

      if (!existingAssignment) {
        throw new Error('배정을 삭제할 권한이 없습니다.');
      }

      await prisma.problemAssignment.delete({
        where: { id: assignmentId },
      });
    } catch (error) {
      logger.error('Failed to delete assignment', { assignmentId, teacherId, error });
      throw new Error('배정 삭제에 실패했습니다.');
    }
  }

  /**
   * 클래스의 모든 배정 조회
   */
  async getClassAssignments(classId: string, teacherId: string): Promise<ProblemAssignment[]> {
    try {
      // 권한 확인
      const hasPermission = await prisma.class.findFirst({
        where: {
          id: classId,
          OR: [
            { createdBy: teacherId },
            {
              members: {
                some: {
                  userId: teacherId,
                  role: 'TEACHER',
                  isActive: true,
                },
              },
            },
          ],
          deletedAt: null,
        },
      });

      if (!hasPermission) {
        throw new Error('해당 클래스에 대한 권한이 없습니다.');
      }

      return this.getAssignments(teacherId, { classId });
    } catch (error) {
      logger.error('Failed to get class assignments', { classId, teacherId, error });
      throw new Error('클래스 배정 목록을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 학생의 모든 배정 조회
   */
  async getStudentAssignments(studentId: string, teacherId: string): Promise<ProblemAssignment[]> {
    try {
      return this.getAssignments(teacherId, { studentId });
    } catch (error) {
      logger.error('Failed to get student assignments', { studentId, teacherId, error });
      throw new Error('학생 배정 목록을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 배정 통계 조회
   */
  async getAssignmentStats(teacherId: string): Promise<AssignmentStats> {
    try {
      const assignments = await prisma.problemAssignment.findMany({
        where: {
          assignedBy: teacherId,
        },
        include: {
          class: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const totalAssignments = assignments.length;
      const activeAssignments = assignments.filter(
        (a) => a.status === AssignmentStatus.ACTIVE,
      ).length;
      const completedAssignments = assignments.filter(
        (a) => a.status === AssignmentStatus.COMPLETED,
      ).length;
      const overdueAssignments = assignments.filter(
        (a) => a.status === AssignmentStatus.ACTIVE && a.dueDate && a.dueDate < new Date(),
      ).length;

      // 배정 타입별 통계
      const assignmentsByType = assignments.reduce(
        (acc, assignment) => {
          const type = assignment.assignmentType;
          if (!acc[type]) acc[type] = 0;
          acc[type]++;
          return acc;
        },
        {} as Record<string, number>,
      );

      // 클래스별 통계
      const assignmentsByClass = assignments
        .filter((a) => a.classId)
        .reduce(
          (acc, assignment) => {
            const classId = assignment.classId!;
            const className = assignment.class?.name || 'Unknown';
            if (!acc[classId]) {
              acc[classId] = { classId, className, count: 0 };
            }
            acc[classId].count++;
            return acc;
          },
          {} as Record<string, { classId: string; className: string; count: number }>,
        );

      return {
        totalAssignments,
        activeAssignments,
        completedAssignments,
        overdueAssignments,
        assignmentsByType: Object.entries(assignmentsByType).map(([type, count]) => ({
          type,
          count,
        })),
        assignmentsByClass: Object.values(assignmentsByClass),
      };
    } catch (error) {
      logger.error('Failed to get assignment stats', { teacherId, error });
      throw new Error('배정 통계를 불러오는데 실패했습니다.');
    }
  }
}

export const assignmentService = new AssignmentService();
