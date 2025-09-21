import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import {
  aiStatsService,
  problemService,
  searchService,
  teacherReportService,
  textbookService,
} from '@/server';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 대시보드 쿼리 스키마
const DashboardQuerySchema = z.object({
  timeRange: z.enum(['1h', '24h', '7d', '30d']).default('24h'),
  includeDetails: z.boolean().default(false),
});

/**
 * 통합 AI 시스템 대시보드
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const parsed = DashboardQuerySchema.safeParse({
      timeRange: searchParams.get('timeRange') || undefined,
      includeDetails: searchParams.get('includeDetails') === 'true' ? true : undefined,
    });

    if (!parsed.success) {
      logger.error('잘못된 요청 데이터입니다.', undefined, { details: parsed.error.errors });
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { timeRange, includeDetails } = parsed.data;

    // 각 서비스에서 통계 데이터 조회
    const [aiStats, problemStats, textbookStats, teacherReportStats, searchStats] =
      await Promise.all([
        aiStatsService.getAIStatsSummary(),
        problemService.getProblemStats(),
        textbookService.getTextbookStats(),
        teacherReportService.getTeacherReportStats(),
        searchService.getSearchStats(),
      ]);

    const dashboardData = {
      summary: {
        totalProblems: problemStats.totalProblems,
        totalTextbooks: textbookStats.totalTextbooks,
        totalReports: teacherReportStats.totalReports,
        totalSearches: searchStats.totalQueries,
        totalApiCalls: aiStats.totalApiCalls,
        totalCostUsd: aiStats.totalCostUsd,
      },
      aiStats: {
        totalTokensUsed: aiStats.totalTokensUsed,
        averageResponseTime: aiStats.averageResponseTime,
        successRate: aiStats.successRate,
        topApiTypes: aiStats.topApiTypes,
      },
      problemStats: {
        bySubject: problemStats.bySubject,
        byDifficulty: problemStats.byDifficulty,
        byStatus: problemStats.byStatus,
        aiGeneratedCount: problemStats.aiGeneratedCount,
      },
      textbookStats: {
        bySubject: textbookStats.bySubject,
        byGradeLevel: textbookStats.byGradeLevel,
        byStatus: textbookStats.byStatus,
      },
      teacherReportStats: {
        byStatus: teacherReportStats.byStatus,
        byAnalysisType: teacherReportStats.byAnalysisType,
      },
      searchStats: {
        averageSearchTime: searchStats.averageSearchTime,
        topSubjects: searchStats.topSubjects,
      },
      timeRange,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    logger.error('대시보드 데이터 조회 API 오류', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '대시보드 데이터 조회에 실패했습니다.' }, { status: 500 });
  }
}
