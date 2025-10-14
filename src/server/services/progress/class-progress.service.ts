import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/logger';
import {
  ClassProgressSummary,
  DifficultyProgress,
  ProgressFilters,
  StudentProgress as ProgressStudentProgress,
  RecentActivity,
  StudentDetailedProgress,
  SubjectProgress,
  TimeAnalysis,
  WeakArea,
} from '@/types/domain/progress';

export class ClassProgressService {
  /**
   * 클래스 전체 진도 요약 조회
   */
  async getClassProgressSummary(
    classId: string,
    teacherId: string,
  ): Promise<ClassProgressSummary | null> {
    try {
      // 권한 확인: 클래스 생성자 또는 TEACHER 역할 멤버만 조회 가능
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
        include: {
          members: {
            where: {
              isActive: true,
              role: 'STUDENT',
            },
            include: {
              user: true,
            },
          },
        },
      });

      if (!hasPermission) {
        return null;
      }

      const students = hasPermission.members.map((member) => member.user);

      // 학생별 진도 계산
      const studentProgresses: ProgressStudentProgress[] = await Promise.all(
        students.map((student) => this.calculateStudentProgress(student.id, classId)),
      );

      // 클래스 전체 통계 계산
      const totalStudents = students.length;
      const activeStudents = studentProgresses.filter(
        (p) => p.lastActivity > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      ).length;
      const averageProgress =
        studentProgresses.reduce((sum, p) => sum + p.progressPercentage, 0) / totalStudents || 0;
      const averageAccuracy =
        studentProgresses.reduce((sum, p) => sum + p.accuracyRate, 0) / totalStudents || 0;
      const totalProblems = studentProgresses.reduce((sum, p) => sum + p.totalProblems, 0);
      const completedProblems = studentProgresses.reduce((sum, p) => sum + p.completedProblems, 0);

      return {
        classId,
        className: hasPermission.name,
        totalStudents,
        activeStudents,
        averageProgress,
        averageAccuracy,
        totalProblems,
        completedProblems,
        students: studentProgresses,
      };
    } catch (error) {
      logger.error('Failed to get class progress summary', { classId, teacherId, error });
      throw new Error('클래스 진도 요약을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 특정 학생의 상세 진도 조회
   */
  async getStudentDetailedProgress(
    studentId: string,
    teacherId: string,
    filters: ProgressFilters = {},
  ): Promise<StudentDetailedProgress | null> {
    try {
      // 권한 확인: 해당 학생이 교사의 클래스에 속해있는지 확인
      const hasPermission = await prisma.classMember.findFirst({
        where: {
          userId: studentId,
          isActive: true,
          class: {
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
        },
        include: {
          user: true,
          class: true,
        },
      });

      if (!hasPermission) {
        return null;
      }

      // const student = hasPermission.user;
      const classInfo = hasPermission.class;

      // 기본 진도 정보
      const basicProgress = await this.calculateStudentProgress(studentId, classInfo.id);

      // 과목별 진도 분석
      const subjectBreakdown = await this.getSubjectBreakdown(studentId, filters);

      // 난이도별 진도 분석
      const difficultyBreakdown = await this.getDifficultyBreakdown(studentId, filters);

      // 시간 분석
      const timeAnalysis = await this.getTimeAnalysis(studentId, filters);

      // 최근 활동
      const recentActivity = await this.getRecentActivity(studentId, filters);

      // 취약 영역
      const weakAreas = await this.getWeakAreas(studentId, filters);

      return {
        ...basicProgress,
        classId: classInfo.id,
        className: classInfo.name,
        subjectBreakdown,
        difficultyBreakdown,
        timeAnalysis,
        recentActivity,
        weakAreas,
      } as StudentDetailedProgress;
    } catch (error) {
      logger.error('Failed to get student detailed progress', { studentId, teacherId, error });
      throw new Error('학생 상세 진도를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 학생 기본 진도 계산
   */
  private async calculateStudentProgress(
    studentId: string,
    classId: string,
  ): Promise<ProgressStudentProgress> {
    const user = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!user) {
      throw new Error('학생을 찾을 수 없습니다.');
    }

    // 클래스에 배정된 문제들 조회
    const classAssignments = await prisma.problemAssignment.findMany({
      where: {
        classId,
        status: 'ACTIVE',
      },
      select: {
        problemIds: true,
      },
    });

    const problemIds = classAssignments.flatMap(
      (assignment) => (assignment.problemIds as string[]) || [],
    );
    const totalProblems = problemIds.length;

    // 학생의 문제 풀이 기록 조회
    const progressRecords = await prisma.problemProgress.findMany({
      where: {
        userId: studentId,
        problemId: {
          in: problemIds,
        },
        completedAt: {
          not: null,
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    const completedProblems = new Set(progressRecords.map((record) => record.problemId)).size;
    const correctAnswers = progressRecords.filter((record) => record.isCorrect).length;
    const totalAttempts = progressRecords.length;
    const averageTimeSpent =
      progressRecords.length > 0
        ? progressRecords.reduce((sum, record) => sum + record.timeSpent, 0) /
          progressRecords.length
        : 0;
    const lastActivity =
      progressRecords.length > 0 && progressRecords[0]?.completedAt
        ? (progressRecords[0].completedAt as Date)
        : new Date(0);
    const progressPercentage = totalProblems > 0 ? (completedProblems / totalProblems) * 100 : 0;
    const accuracyRate = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;

    return {
      studentId,
      studentName: user.name,
      studentEmail: user.email,
      totalProblems,
      completedProblems,
      correctAnswers,
      totalAttempts,
      averageTimeSpent,
      lastActivity,
      progressPercentage,
      accuracyRate,
      classId,
    };
  }

  /**
   * 과목별 진도 분석
   */
  private async getSubjectBreakdown(
    studentId: string,
    filters: ProgressFilters,
  ): Promise<SubjectProgress[]> {
    const whereClause: any = {
      userId: studentId,
      completedAt: { not: null },
    };

    if (filters.startDate || filters.endDate) {
      whereClause.completedAt = {};
      if (filters.startDate) whereClause.completedAt.gte = filters.startDate;
      if (filters.endDate) whereClause.completedAt.lte = filters.endDate;
    }

    const progressRecords = await prisma.problemProgress.findMany({
      where: whereClause,
      include: {
        problem: true,
      },
    });

    const subjectMap = new Map<string, SubjectProgress>();

    progressRecords.forEach((record) => {
      const subject = record.problem.subject;
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, {
          subject,
          totalProblems: 0,
          completedProblems: 0,
          correctAnswers: 0,
          accuracyRate: 0,
          averageTimeSpent: 0,
        });
      }

      const subjectProgress = subjectMap.get(subject)!;
      subjectProgress.totalProblems++;
      subjectProgress.completedProblems++;
      if (record.isCorrect) subjectProgress.correctAnswers++;
    });

    // 통계 계산
    const result = Array.from(subjectMap.values()).map((subject) => ({
      ...subject,
      accuracyRate:
        subject.completedProblems > 0
          ? (subject.correctAnswers / subject.completedProblems) * 100
          : 0,
      averageTimeSpent:
        subject.completedProblems > 0
          ? progressRecords
              .filter((r) => r.problem.subject === subject.subject)
              .reduce((sum, r) => sum + r.timeSpent, 0) / subject.completedProblems
          : 0,
    }));

    return result;
  }

  /**
   * 난이도별 진도 분석
   */
  private async getDifficultyBreakdown(
    studentId: string,
    filters: ProgressFilters,
  ): Promise<DifficultyProgress[]> {
    const whereClause: any = {
      userId: studentId,
      completedAt: { not: null },
    };

    if (filters.startDate || filters.endDate) {
      whereClause.completedAt = {};
      if (filters.startDate) whereClause.completedAt.gte = filters.startDate;
      if (filters.endDate) whereClause.completedAt.lte = filters.endDate;
    }

    const progressRecords = await prisma.problemProgress.findMany({
      where: whereClause,
      include: {
        problem: true,
      },
    });

    const difficultyMap = new Map<string, DifficultyProgress>();

    progressRecords.forEach((record) => {
      const difficulty = record.problem.difficulty;
      if (!difficultyMap.has(difficulty)) {
        difficultyMap.set(difficulty, {
          difficulty,
          totalProblems: 0,
          completedProblems: 0,
          correctAnswers: 0,
          accuracyRate: 0,
          averageTimeSpent: 0,
        });
      }

      const difficultyProgress = difficultyMap.get(difficulty)!;
      difficultyProgress.totalProblems++;
      difficultyProgress.completedProblems++;
      if (record.isCorrect) difficultyProgress.correctAnswers++;
    });

    // 통계 계산
    const result = Array.from(difficultyMap.values()).map((difficulty) => ({
      ...difficulty,
      accuracyRate:
        difficulty.completedProblems > 0
          ? (difficulty.correctAnswers / difficulty.completedProblems) * 100
          : 0,
      averageTimeSpent:
        difficulty.completedProblems > 0
          ? progressRecords
              .filter((r) => r.problem.difficulty === difficulty.difficulty)
              .reduce((sum, r) => sum + r.timeSpent, 0) / difficulty.completedProblems
          : 0,
    }));

    return result;
  }

  /**
   * 시간 분석
   */
  private async getTimeAnalysis(
    studentId: string,
    filters: ProgressFilters,
  ): Promise<TimeAnalysis> {
    const whereClause: any = {
      userId: studentId,
      completedAt: { not: null },
    };

    if (filters.startDate || filters.endDate) {
      whereClause.completedAt = {};
      if (filters.startDate) whereClause.completedAt.gte = filters.startDate;
      if (filters.endDate) whereClause.completedAt.lte = filters.endDate;
    }

    const progressRecords = await prisma.problemProgress.findMany({
      where: whereClause,
      orderBy: {
        completedAt: 'asc',
      },
    });

    if (progressRecords.length === 0) {
      return {
        totalStudyTime: 0,
        averageSessionTime: 0,
        longestSession: 0,
        shortestSession: 0,
        studyDays: 0,
        averageProblemsPerSession: 0,
      };
    }

    const totalStudyTime = progressRecords.reduce((sum, record) => sum + record.timeSpent, 0);
    const averageSessionTime = totalStudyTime / progressRecords.length;
    const longestSession = Math.max(...progressRecords.map((record) => record.timeSpent));
    const shortestSession = Math.min(...progressRecords.map((record) => record.timeSpent));

    // 학습 일수 계산 (같은 날짜의 기록들을 그룹화)
    const studyDays = new Set(
      progressRecords
        .filter((r) => r.completedAt)
        .map((record) => (record.completedAt as Date).toDateString()),
    ).size;

    const averageProblemsPerSession = progressRecords.length / studyDays;

    return {
      totalStudyTime,
      averageSessionTime,
      longestSession,
      shortestSession,
      studyDays,
      averageProblemsPerSession,
    };
  }

  /**
   * 최근 활동 조회
   */
  private async getRecentActivity(
    studentId: string,
    filters: ProgressFilters,
  ): Promise<RecentActivity[]> {
    const whereClause: any = {
      userId: studentId,
      completedAt: { not: null },
    };

    if (filters.startDate || filters.endDate) {
      whereClause.completedAt = {};
      if (filters.startDate) whereClause.completedAt.gte = filters.startDate;
      if (filters.endDate) whereClause.completedAt.lte = filters.endDate;
    }

    const progressRecords = await prisma.problemProgress.findMany({
      where: whereClause,
      orderBy: {
        completedAt: 'desc',
      },
      take: 30, // 최근 30개 기록
    });

    // 날짜별로 그룹화
    const dailyActivity = new Map<string, RecentActivity>();

    progressRecords.forEach((record) => {
      const date = record.completedAt!.toDateString();
      if (!dailyActivity.has(date)) {
        dailyActivity.set(date, {
          date: record.completedAt!,
          problemsAttempted: 0,
          problemsCompleted: 0,
          correctAnswers: 0,
          timeSpent: 0,
        });
      }

      const activity = dailyActivity.get(date)!;
      activity.problemsAttempted++;
      activity.problemsCompleted++;
      if (record.isCorrect) activity.correctAnswers++;
      activity.timeSpent += record.timeSpent;
    });

    return Array.from(dailyActivity.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * 취약 영역 분석
   */
  private async getWeakAreas(studentId: string, filters: ProgressFilters): Promise<WeakArea[]> {
    const whereClause: any = {
      userId: studentId,
      completedAt: { not: null },
    };

    if (filters.startDate || filters.endDate) {
      whereClause.completedAt = {};
      if (filters.startDate) whereClause.completedAt.gte = filters.startDate;
      if (filters.endDate) whereClause.completedAt.lte = filters.endDate;
    }

    const progressRecords = await prisma.problemProgress.findMany({
      where: whereClause,
      include: {
        problem: true,
      },
    });

    // 과목-난이도-문제유형별로 그룹화
    const areaMap = new Map<string, WeakArea>();

    progressRecords.forEach((record) => {
      const key = `${record.problem.subject}-${record.problem.difficulty}-${record.problem.type}`;
      if (!areaMap.has(key)) {
        areaMap.set(key, {
          subject: record.problem.subject,
          difficulty: record.problem.difficulty,
          problemType: record.problem.type,
          errorRate: 0,
          totalAttempts: 0,
          lastAttempted: record.completedAt!,
        });
      }

      const area = areaMap.get(key)!;
      area.totalAttempts++;
      if (!record.isCorrect) {
        area.errorRate = (area.errorRate * (area.totalAttempts - 1) + 1) / area.totalAttempts;
      } else {
        area.errorRate = (area.errorRate * (area.totalAttempts - 1)) / area.totalAttempts;
      }
      if (record.completedAt! > area.lastAttempted) {
        area.lastAttempted = record.completedAt!;
      }
    });

    // 오답률이 높은 순으로 정렬
    return Array.from(areaMap.values())
      .filter((area) => area.errorRate > 0.3) // 오답률 30% 이상
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 10); // 상위 10개
  }
}

export const classProgressService = new ClassProgressService();
