import { prisma } from '../../../lib/core/prisma';
import { logger } from '../../../lib/monitoring';
import { ClassWithDetails } from '../../../types/domain/class';

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
            where: { classId, isActive: true },
          }),
          prisma.attempt.count({
            where: { classId },
          }),
          prisma.attempt.aggregate({
            where: { classId },
            _avg: { timeSpent: true },
          }),
          prisma.attempt.count({
            where: { classId, isCorrect: true },
          }),
        ]);

      if (!classInfo) {
        throw new Error('클래스를 찾을 수 없습니다.');
      }

      const totalAttempts = await prisma.attempt.count({
        where: { classId },
      });

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
  async getUserClasses(userId: string, role?: string): Promise<ClassWithDetails[]> {
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
      });

      return classes.map((cls) => ({
        ...cls,
        memberCount: cls.members.length,
        assignmentCount: cls.assignments.length,
        members: cls.members.map((member) => ({
          ...member,
          role: member.role as any,
        })),
      }));
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
          const attempts = await prisma.attempt.findMany({
            where: {
              userId: student.userId,
              classId,
            },
            include: {
              problem: {
                select: {
                  id: true,
                  title: true,
                  difficulty: true,
                },
              },
            },
          });

          const totalAttempts = attempts.length;
          const correctAttempts = attempts.filter((attempt) => attempt.isCorrect).length;
          const averageScore =
            totalAttempts > 0
              ? attempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0) / totalAttempts
              : 0;

          const difficultyStats = attempts.reduce(
            (stats, attempt) => {
              const difficulty = attempt.problem.difficulty;
              if (!stats[difficulty]) {
                stats[difficulty] = { total: 0, correct: 0 };
              }
              stats[difficulty].total++;
              if (attempt.isCorrect) {
                stats[difficulty].correct++;
              }
              return stats;
            },
            {} as Record<string, { total: number; correct: number }>,
          );

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
          isActive: true,
        },
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const completionData = await Promise.all(
        assignments.map(async (assignment) => {
          const totalStudents = await prisma.classMember.count({
            where: {
              classId: assignment.classId,
              role: 'STUDENT',
              isActive: true,
            },
          });

          const completedAttempts = await prisma.attempt.count({
            where: {
              problemId: assignment.problemId,
              classId: assignment.classId,
              isCorrect: true,
            },
          });

          const completionRate = totalStudents > 0 ? (completedAttempts / totalStudents) * 100 : 0;

          return {
            assignment: {
              id: assignment.id,
              problemId: assignment.problemId,
              problemTitle: assignment.problem.title,
              difficulty: assignment.problem.difficulty,
              dueDate: assignment.dueDate,
              instructions: assignment.instructions,
            },
            class: {
              id: assignment.class.id,
              name: assignment.class.name,
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
