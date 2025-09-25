import { prisma } from '@/lib/core/prisma';
import {
  Class,
  ClassMember,
  ClassMemberQueryParams,
  ClassMemberRole,
  ClassMemberWithDetails,
  ClassQueryParams,
  ClassWithDetails,
  CreateClassMemberRequest,
  CreateClassRequest,
  CreateProblemAssignmentRequest,
  PaginatedResponse,
  ProblemAssignment,
  ProblemAssignmentQueryParams,
  ProblemAssignmentWithDetails,
  UpdateClassMemberRequest,
  UpdateClassRequest,
  UpdateProblemAssignmentRequest,
} from '@/types/domain/class';

export class ClassService {
  // ===== 클래스 관리 =====

  /**
   * 클래스 목록 조회 (페이지네이션)
   */
  async getClasses(params: ClassQueryParams = {}): Promise<PaginatedResponse<ClassWithDetails>> {
    const {
      page = 1,
      limit = 10,
      subject,
      gradeLevel,
      schoolYear,
      semester,
      isActive,
      createdBy,
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (subject) where.subject = subject;
    if (gradeLevel) where.gradeLevel = gradeLevel;
    if (schoolYear) where.schoolYear = schoolYear;
    if (semester) where.semester = semester;
    if (isActive !== undefined) where.isActive = isActive;
    if (createdBy) where.createdBy = createdBy;
    where.deletedAt = null;

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: true,
          members: {
            include: {
              user: true,
            },
          },
          assignments: {
            include: {
              problem: true,
              assigner: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.class.count({ where }),
    ]);

    const classesWithDetails: ClassWithDetails[] = classes.map((cls) => ({
      ...cls,
      memberCount: cls.members.length,
      assignmentCount: cls.assignments.length,
      members: cls.members.map((member) => ({
        ...member,
        role: member.role as ClassMemberRole,
      })),
    }));

    return {
      success: true,
      data: classesWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 클래스 상세 조회
   */
  async getClassById(id: string): Promise<ClassWithDetails | null> {
    const cls = await prisma.class.findUnique({
      where: { id, deletedAt: null },
      include: {
        creator: true,
        members: {
          include: {
            user: true,
          },
        },
        assignments: {
          include: {
            problem: true,
            assigner: true,
          },
        },
      },
    });

    if (!cls) return null;

    return {
      ...cls,
      memberCount: cls.members.length,
      assignmentCount: cls.assignments.length,
      members: cls.members.map((member) => ({
        ...member,
        role: member.role as ClassMemberRole,
      })),
    };
  }

  /**
   * 클래스 생성
   */
  async createClass(data: CreateClassRequest, createdBy: string): Promise<Class> {
    return prisma.class.create({
      data: {
        ...data,
        createdBy,
      },
    });
  }

  /**
   * 클래스 수정
   */
  async updateClass(id: string, data: UpdateClassRequest): Promise<Class> {
    return prisma.class.update({
      where: { id, deletedAt: null },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 클래스 삭제 (소프트 삭제)
   */
  async deleteClass(id: string): Promise<void> {
    await prisma.class.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  // ===== 클래스 멤버 관리 =====

  /**
   * 클래스 멤버 목록 조회
   */
  async getClassMembers(
    params: ClassMemberQueryParams = {},
  ): Promise<PaginatedResponse<ClassMemberWithDetails>> {
    const { page = 1, limit = 10, classId, userId, role, isActive } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (classId) where.classId = classId;
    if (userId) where.userId = userId;
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    const [members, total] = await Promise.all([
      prisma.classMember.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
          class: true,
        },
        orderBy: {
          joinedAt: 'desc',
        },
      }),
      prisma.classMember.count({ where }),
    ]);

    return {
      success: true,
      data: members.map((member) => ({
        ...member,
        role: member.role as ClassMemberRole,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 클래스에 멤버 추가
   */
  async addClassMember(data: CreateClassMemberRequest): Promise<ClassMember> {
    const member = await prisma.classMember.create({
      data: {
        ...data,
        role: data.role || 'STUDENT',
      },
    });
    return {
      ...member,
      role: member.role as ClassMemberRole,
    };
  }

  /**
   * 클래스 멤버 수정
   */
  async updateClassMember(id: string, data: UpdateClassMemberRequest): Promise<ClassMember> {
    const member = await prisma.classMember.update({
      where: { id },
      data,
    });
    return {
      ...member,
      role: member.role as ClassMemberRole,
    };
  }

  /**
   * 클래스에서 멤버 제거
   */
  async removeClassMember(id: string): Promise<void> {
    await prisma.classMember.update({
      where: { id },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    });
  }

  /**
   * 사용자가 속한 클래스 목록 조회
   */
  async getUserClasses(userId: string): Promise<ClassWithDetails[]> {
    const memberships = await prisma.classMember.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        class: {
          include: {
            creator: true,
            members: {
              include: {
                user: true,
              },
            },
            assignments: {
              include: {
                problem: true,
                assigner: true,
              },
            },
          },
        },
      },
    });

    return memberships.map((membership) => ({
      ...membership.class,
      memberCount: membership.class.members.length,
      assignmentCount: membership.class.assignments.length,
      members: membership.class.members.map((member) => ({
        ...member,
        role: member.role as ClassMemberRole,
      })),
    }));
  }

  // ===== 문제 할당 관리 =====

  /**
   * 문제 할당 목록 조회
   */
  async getProblemAssignments(
    params: ProblemAssignmentQueryParams = {},
  ): Promise<PaginatedResponse<ProblemAssignmentWithDetails>> {
    const { page = 1, limit = 10, classId, problemId, assignedBy, isActive, dueDate } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (classId) where.classId = classId;
    if (problemId) where.problemId = problemId;
    if (assignedBy) where.assignedBy = assignedBy;
    if (isActive !== undefined) where.isActive = isActive;
    if (dueDate) where.dueDate = { lte: dueDate };

    const [assignments, total] = await Promise.all([
      prisma.problemAssignment.findMany({
        where,
        skip,
        take: limit,
        include: {
          class: true,
          problem: true,
          assigner: true,
        },
        orderBy: {
          assignedAt: 'desc',
        },
      }),
      prisma.problemAssignment.count({ where }),
    ]);

    return {
      success: true,
      data: assignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 문제 할당
   */
  async assignProblem(
    data: CreateProblemAssignmentRequest,
    assignedBy: string,
  ): Promise<ProblemAssignment> {
    return prisma.problemAssignment.create({
      data: {
        ...data,
        assignedBy,
      },
    });
  }

  /**
   * 문제 할당 수정
   */
  async updateProblemAssignment(
    id: string,
    data: UpdateProblemAssignmentRequest,
  ): Promise<ProblemAssignment> {
    return prisma.problemAssignment.update({
      where: { id },
      data,
    });
  }

  /**
   * 문제 할당 취소
   */
  async cancelProblemAssignment(id: string): Promise<void> {
    await prisma.problemAssignment.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  /**
   * 클래스별 할당된 문제 목록 조회
   */
  async getClassAssignments(classId: string): Promise<ProblemAssignmentWithDetails[]> {
    return prisma.problemAssignment.findMany({
      where: {
        classId,
        isActive: true,
      },
      include: {
        class: true,
        problem: true,
        assigner: true,
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });
  }

  /**
   * 학생별 할당된 문제 목록 조회
   */
  async getStudentAssignments(studentId: string): Promise<ProblemAssignmentWithDetails[]> {
    // 학생이 속한 클래스들 조회
    const studentClasses = await prisma.classMember.findMany({
      where: {
        userId: studentId,
        isActive: true,
      },
      select: {
        classId: true,
      },
    });

    const classIds = studentClasses.map((sc) => sc.classId);

    return prisma.problemAssignment.findMany({
      where: {
        classId: {
          in: classIds,
        },
        isActive: true,
      },
      include: {
        class: true,
        problem: true,
        assigner: true,
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });
  }

  // ===== 통계 및 분석 =====

  /**
   * 클래스 통계 조회
   */
  async getClassStats(classId: string) {
    const [memberCount, assignmentCount, attemptCount, completedAttempts, averageScore] =
      await Promise.all([
        prisma.classMember.count({
          where: { classId, isActive: true },
        }),
        prisma.problemAssignment.count({
          where: { classId, isActive: true },
        }),
        prisma.attempt.count({
          where: { classId },
        }),
        prisma.attempt.count({
          where: { classId, isCorrect: true },
        }),
        prisma.attempt.aggregate({
          where: { classId },
          _avg: {
            timeSpent: true,
          },
        }),
      ]);

    return {
      memberCount,
      assignmentCount,
      attemptCount,
      completedAttempts,
      successRate: attemptCount > 0 ? (completedAttempts / attemptCount) * 100 : 0,
      averageTimeSpent: averageScore._avg.timeSpent || 0,
    };
  }

  /**
   * 학생별 클래스 내 성취도 조회
   */
  async getStudentClassPerformance(studentId: string, classId: string) {
    const attempts = await prisma.attempt.findMany({
      where: {
        userId: studentId,
        classId,
      },
      include: {
        problem: true,
      },
    });

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter((a) => a.isCorrect).length;
    const averageTimeSpent =
      attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / totalAttempts || 0;

    return {
      totalAttempts,
      correctAttempts,
      successRate: totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0,
      averageTimeSpent,
      attempts,
    };
  }
}

// 싱글톤 인스턴스
export const classService = new ClassService();
