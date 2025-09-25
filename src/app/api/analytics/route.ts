import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { analyticsService } from '@/server/services/analytics.service';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// 애널리틱스 요약 스키마
const AnalyticsSummarySchema = z.object({
  totalUsers: z.number(),
  totalProblems: z.number(),
  totalAttempts: z.number(),
  averageScore: z.number(),
  recentActivity: z.array(
    z.object({
      date: z.string(),
      count: z.number(),
    }),
  ),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const summary = await analyticsService.getSummary();
    const parsed = AnalyticsSummarySchema.safeParse(summary);
    if (!parsed.success) {
      return NextResponse.json({ error: '응답 스키마 검증 실패' }, { status: 500 });
    }
    return NextResponse.json(parsed.data);
  } catch (error) {
    logger.error('애널리틱스 API 오류', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '애널리틱스 조회에 실패했습니다.' }, { status: 500 });
  }
}
