import { prisma } from '../../../lib/core/prisma';
import { logger } from '../../../lib/monitoring';
import { ClassWithStats } from '../../../types/domain/class';

export class ClassStatsService {
  /**
   * 클래스 통계 조회
   */
  async getClassStats(classId: string): Promise<any> {
    try {
      const [classInfo, memberCount, assignmentCount, attemptCount, averageScore, completionRate] =
        await Promise.all([
          prisma.class.findUnique({
            where: { id: classId },
            select: {
              id: true,
              name: true,
              subject: true,
              gradeLevel: true,
              createdAt: true,
            },
          }),
          prisma.classMember.count({
            where: { classId, isActive: true },
          }),
          prisma.problemAssignment.count({
            where: { classId },
          }),
          Promise.resolve(0), // 임시로 0 반환
          Promise.resolve({ _avg: { timeSpent: 0 } }), // 임시로 0 반환
          Promise.resolve(0), // 임시로 0 반환
        ]);

      if (!classInfo) {
        throw new Error('클래스를 찾을 수 없습니다.');
      }

      const totalAttempts = 0; // 임시로 0으로 설정

      const completionRateValue = totalAttempts > 0 ? (completionRate / totalAttempts) * 100 : 0;

      return {
        class: classInfo,
        memberCount,
        assignmentCount,
        attemptCount,
        averageScore: averageScore._avg.timeSpent || 0,
        completionRate: Math.round(completionRateValue * 100) / 100,
        createdAt: classInfo.createdAt,
      };
    } catch (error) {
      logger.error('클래스 통계 조회 실패', undefined, {
        classId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('클래스 통계 조회에 실패했습니다.');
    }
  }

  /**
   * 사용자의 클래스 목록 조회
   */
  async getUserClasses(userId: string, role?: string): Promise<ClassWithStats[]> {
    try {
      const where: any = {
        members: {
          some: {
            userId,
            isActive: true,
          },
        },
      };

      if (role) {
        where.members.some.role = role;
      }

      const classes = await prisma.class.findMany({
        where,
        include: {
          creator: true,
          members: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return classes.map(
        (cls) =>
          ({
            ...cls,
            description: cls.description ?? '',
            memberCount: cls.members.length,
            stats: {
              totalMembers: cls.members.length,
              activeMembers: cls.members.filter((m) => m.isActive).length,
              totalAssignments: 0,
              completedAssignments: 0,
              averageProgress: 0,
            },
          }) as unknown as ClassWithStats,
      );
    } catch (error) {
      logger.error('사용자 클래스 목록 조회 실패', undefined, {
        userId,
        role,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('사용자 클래스 목록 조회에 실패했습니다.');
    }
  }

  /**
   * 클래스 내 학생 성과 분석
   */
  async getStudentPerformanceInClass(classId: string): Promise<any[]> {
    try {
      const students = await prisma.classMember.findMany({
        where: {
          classId,
          role: 'STUDENT',
          isActive: true,
        },
        include: {
          user: true,
          class: true,
        },
      });

      const performanceData = await Promise.all(
        students.map(async (student) => {
          // attempts 테이블 제거됨 - ProblemProgress로 대체
          // 임시로 빈 데이터 반환
          const totalAttempts = 0;
          const correctAttempts = 0;
          const averageScore = 0;
          const difficultyStats = {};

          return {
            student: {
              id: student.user.id,
              name: student.user.name,
              email: student.user.email,
            },
            class: {
              id: student.class.id,
              name: student.class.name,
            },
            performance: {
              totalAttempts,
              correctAttempts,
              accuracy: totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0,
              averageScore: Math.round(averageScore * 100) / 100,
              difficultyStats,
            },
          };
        }),
      );

      return performanceData;
    } catch (error) {
      logger.error('학생 성과 분석 실패', undefined, {
        classId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('학생 성과 분석에 실패했습니다.');
    }
  }

  /**
   * 클래스별 과제 완료율 분석
   */
  async getAssignmentCompletionRates(classId: string): Promise<any[]> {
    try {
      const assignments = await prisma.problemAssignment.findMany({
        where: {
          classId,
        },
        select: {
          id: true,
          title: true,
          assignmentType: true,
          status: true,
          classId: true,
          problemIds: true,
          dueDate: true,
          instructions: true,
        },
      });

      const completionData = await Promise.all(
        assignments.map(async (assignment) => {
          const totalStudents = await prisma.classMember.count({
            where: {
              classId: assignment.classId!,
              role: 'STUDENT',
              isActive: true,
            },
          });

          const completedAttempts = 0; // 임시로 0으로 설정

          const completionRate = totalStudents > 0 ? (completedAttempts / totalStudents) * 100 : 0;

          return {
            assignment: {
              id: assignment.id,
              problemIds: assignment.problemIds as string[],
              dueDate: assignment.dueDate,
              instructions: assignment.instructions,
            },
            class: {
              id: assignment.classId!,
              name: '',
            },
            completion: {
              totalStudents,
              completedAttempts,
              completionRate: Math.round(completionRate * 100) / 100,
            },
          };
        }),
      );

      return completionData;
    } catch (error) {
      logger.error('과제 완료율 분석 실패', undefined, {
        classId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('과제 완료율 분석에 실패했습니다.');
    }
  }
}
