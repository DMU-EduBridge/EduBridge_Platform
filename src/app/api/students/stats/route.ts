import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 학생 통계 조회
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 교사만 접근 가능
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const teacherId = session.user.id;

    // 교사와 관계된 학생 ID 가져오기
    const relatedStudents = await prisma.teacherStudent.findMany({
      where: { teacherId },
      select: { studentId: true },
    });

    // 학생 ID 목록 추출
    const studentIds = relatedStudents.map((relation) => relation.studentId);

    // 학생이 없으면 빈 통계 반환
    if (studentIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalStudents: 0,
          activeStudents: 0,
          weeklyChange: 0,
          averageProgress: 0,
          averageScore: 0,
        },
      });
    }

    const [totalStudents, activeStudents, weeklyChange] = await Promise.all([
      // 총 학생 수
      prisma.user.count({
        where: {
          id: { in: studentIds },
          role: 'STUDENT',
        },
      }),
      // 활성 학생 수
      prisma.user.count({
        where: {
          id: { in: studentIds },
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      }),
      // 이번 주 신규 학생 수
      prisma.teacherStudent.count({
        where: {
          teacherId: teacherId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // 평균 진도율 계산 (문제 정답률 기반)
    const progressData = await prisma.problemProgress.findMany({
      where: {
        user: {
          id: { in: studentIds },
        },
      },
      select: {
        isCorrect: true,
      },
    });

    const averageProgress =
      progressData.length > 0
        ? (progressData.filter((p) => p.isCorrect).length / progressData.length) * 100
        : 0;

    // 평균 점수 계산 (시도 기록 기반)
    const scoreData = await prisma.attempt.findMany({
      where: {
        user: {
          id: { in: studentIds },
        },
      },
      select: {
        isCorrect: true,
      },
    });

    const averageScore =
      scoreData.length > 0
        ? (scoreData.filter((s) => s.isCorrect).length / scoreData.length) * 100
        : 0;

    const stats = {
      totalStudents,
      activeStudents,
      weeklyChange,
      averageProgress: Math.round(averageProgress),
      averageScore: Math.round(averageScore),
    };

    logger.info('학생 통계 조회 성공', { userId: teacherId });
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    logger.error('학생 통계 조회 실패', undefined, { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
