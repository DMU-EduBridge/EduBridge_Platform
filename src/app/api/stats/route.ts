import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/core/prisma';

// 문제 통계
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // 조건부 쿼리 설정
    const getWhereCondition = () => {
      if (type === 'problems') {
        return { isActive: true };
      } else if (type === 'students') {
        return { role: 'STUDENT', status: 'ACTIVE' };
      } else if (type === 'reports') {
        return { status: 'COMPLETED' };
      }
      return {};
    };

    let stats;

    if (type === 'problems') {
      const whereCondition = getWhereCondition();
      const [totalProblems, activeProblems, bySubject, byDifficulty] = await Promise.all([
        prisma.problem.count(),
        prisma.problem.count({ where: whereCondition }),
        prisma.problem.groupBy({
          by: ['subject'],
          _count: { subject: true },
        }),
        prisma.problem.groupBy({
          by: ['difficulty'],
          _count: { difficulty: true },
        }),
      ]);

      stats = {
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
      };
    } else if (type === 'students') {
      const [totalStudents, activeStudents, byGrade, allStudentsWithProgress] = await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
        prisma.user.groupBy({
          by: ['grade'],
          where: { role: 'STUDENT' },
          _count: { grade: true },
        }),
        prisma.user.findMany({
          where: { role: 'STUDENT' },
          include: { progress: true },
        }),
      ]);

      // 전체 평균 진도율과 점수 계산
      let totalProgress = 0;
      let totalScore = 0;
      let studentsWithProgress = 0;

      allStudentsWithProgress.forEach((student) => {
        if (student.progress.length > 0) {
          const completedProblems = student.progress.filter((p) => p.status === 'COMPLETED').length;
          const progress = Math.round((completedProblems / student.progress.length) * 100);
          const avgScore = Math.round(
            student.progress.reduce((sum, p) => sum + (p.score || 0), 0) / student.progress.length,
          );

          totalProgress += progress;
          totalScore += avgScore;
          studentsWithProgress++;
        }
      });

      const averageProgress =
        studentsWithProgress > 0 ? Math.round(totalProgress / studentsWithProgress) : 0;
      const averageScore =
        studentsWithProgress > 0 ? Math.round(totalScore / studentsWithProgress) : 0;

      stats = {
        totalStudents,
        activeStudents,
        activeRate: totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0,
        averageProgress,
        averageScore,
        weeklyChange: 2, // 임시 값
        progressChange: 5, // 임시 값
        scoreChange: 3, // 임시 값
        byGrade: byGrade.reduce(
          (acc, item) => {
            if (item.grade) {
              acc[item.grade] = item._count.grade;
            }
            return acc;
          },
          {} as Record<string, number>,
        ),
      };
    } else if (type === 'reports') {
      const [totalReports, completedReports, byType] = await Promise.all([
        prisma.analysisReport.count(),
        prisma.analysisReport.count({ where: { status: 'COMPLETED' } }),
        prisma.analysisReport.groupBy({
          by: ['type'],
          _count: { type: true },
        }),
      ]);

      stats = {
        totalReports,
        completedReports,
        completionRate: totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0,
        weeklyChange: 3, // 임시 값
        monthlyChange: 8, // 임시 값
        byType: byType.reduce(
          (acc, item) => {
            acc[item.type] = item._count.type;
            return acc;
          },
          {} as Record<string, number>,
        ),
      };
    } else {
      // 전체 통계
      const [totalProblems, totalStudents, totalReports, activeStudents] = await Promise.all([
        prisma.problem.count({ where: { isActive: true } }),
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.analysisReport.count(),
        prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
      ]);

      stats = {
        totalProblems,
        totalStudents,
        activeStudents,
        totalReports,
        averageProgress: 75, // 임시 값
        averageScore: 82, // 임시 값
      };
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
