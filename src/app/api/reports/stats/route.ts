import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 리포트 통계 조회
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

    const [totalReports, completedReports, weeklyChange] = await Promise.all([
      // 총 리포트 수
      prisma.teacherReport.count({
        where: { createdBy: session.user.id },
      }),
      // 완료된 리포트 수
      prisma.teacherReport.count({
        where: {
          createdBy: session.user.id,
          status: 'COMPLETED',
        },
      }),
      // 이번 주 생성된 리포트 수
      prisma.teacherReport.count({
        where: {
          createdBy: session.user.id,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // 평균 분석 시간 계산 (생성 시간 기반)
    const reportsWithTime = await prisma.teacherReport.findMany({
      where: {
        createdBy: session.user.id,
        generationTimeMs: {
          not: null,
        },
      },
      select: {
        generationTimeMs: true,
      },
    });

    const averageAnalysisTime =
      reportsWithTime.length > 0
        ? reportsWithTime.reduce((sum, r) => sum + (r.generationTimeMs || 0), 0) /
          reportsWithTime.length /
          1000 /
          60 // 분 단위
        : 0;

    // 개선 제안 수 (현재는 리포트 수로 대체)
    const improvementSuggestions = totalReports;

    const stats = {
      totalReports,
      completedReports,
      weeklyChange,
      averageAnalysisTime: Math.round(averageAnalysisTime),
      improvementSuggestions,
    };

    logger.info('리포트 통계 조회 성공', { userId: session.user.id });
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    logger.error('리포트 통계 조회 실패', undefined, { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
