import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 통합 대시보드 데이터 조회 스키마
const DashboardSchema = z.object({
  timeRange: z.enum(['1h', '24h', '7d', '30d']).default('24h'),
  includeDetails: z.boolean().default(false),
});

/**
 * 통합 AI 시스템 대시보드 API
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = {
      timeRange: searchParams.get('timeRange') || '24h',
      includeDetails: searchParams.get('includeDetails') === 'true',
    };

    const parsed = DashboardSchema.safeParse(query);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { timeRange, includeDetails } = parsed.data;

    // 시간 범위 계산
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    const timeRangeMs = timeRanges[timeRange];
    const startTime = new Date(Date.now() - timeRangeMs);

    // 기본 통계 조회
    const [
      totalTextbooks,
      totalQuestions,
      totalReports,
      totalSearches,
      totalUsers,
      recentActivity,
      serverStatuses,
      apiUsage,
      performanceMetrics,
    ] = await Promise.all([
      // 총 개수
      prisma.textbook.count(),
      prisma.aIGeneratedQuestion.count(),
      prisma.teacherReport.count(),
      prisma.searchQuery.count(),
      prisma.user.count({ where: { role: { in: ['TEACHER', 'ADMIN'] } } }),

      // 최근 활동
      getRecentActivity(startTime),

      // 서버 상태
      prisma.aIServerStatus.findMany({
        orderBy: { lastChecked: 'desc' },
      }),

      // API 사용량
      prisma.aIApiUsage.findMany({
        where: { createdAt: { gte: startTime } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),

      // 성능 지표
      prisma.aIPerformanceMetric.findMany({
        where: { createdAt: { gte: startTime } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    // 시간대별 활동 통계
    const activityStats = generateActivityStats(recentActivity, timeRange);

    // 서버별 사용량 통계
    const serverUsageStats = generateServerUsageStats(apiUsage);

    // 성능 통계
    const performanceStats = generatePerformanceStats(performanceMetrics);

    // 사용자별 활동 통계 (관리자만)
    let userActivityStats = null;
    if (session.user.role === 'ADMIN' && includeDetails) {
      userActivityStats = await getUserActivityStats(startTime);
    }

    // 상세 통계 (관리자만)
    let detailedStats = null;
    if (session.user.role === 'ADMIN' && includeDetails) {
      detailedStats = await getDetailedStats(startTime);
    }

    return NextResponse.json({
      success: true,
      dashboard: {
        overview: {
          totalTextbooks,
          totalQuestions,
          totalReports,
          totalSearches,
          totalUsers,
          timeRange,
        },
        activity: activityStats,
        servers: serverStatuses.map((server) => ({
          serverName: server.serverName,
          status: server.status,
          responseTimeMs: server.responseTimeMs,
          version: server.version,
          lastChecked: server.lastChecked,
          errorMessage: server.errorMessage,
        })),
        usage: serverUsageStats,
        performance: performanceStats,
        ...(userActivityStats && { userActivity: userActivityStats }),
        ...(detailedStats && { detailed: detailedStats }),
      },
    });
  } catch (error) {
    console.error('대시보드 데이터 조회 오류:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : '대시보드 데이터 조회 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}

/**
 * 최근 활동 조회
 */
async function getRecentActivity(startTime: Date) {
  const [recentTextbooks, recentQuestions, recentReports, recentSearches] = await Promise.all([
    prisma.textbook.findMany({
      where: { createdAt: { gte: startTime } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.aIGeneratedQuestion.findMany({
      where: { createdAt: { gte: startTime } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { id: true, name: true, email: true } },
        textbook: { select: { id: true, title: true } },
      },
    }),
    prisma.teacherReport.findMany({
      where: { createdAt: { gte: startTime } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.searchQuery.findMany({
      where: { createdAt: { gte: startTime } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return {
    textbooks: recentTextbooks,
    questions: recentQuestions,
    reports: recentReports,
    searches: recentSearches,
  };
}

/**
 * 활동 통계 생성
 */
function generateActivityStats(recentActivity: any, timeRange: string) {
  const stats = {
    textbooks: {
      total: recentActivity.textbooks.length,
      byHour: groupByHour(recentActivity.textbooks, timeRange),
    },
    questions: {
      total: recentActivity.questions.length,
      byHour: groupByHour(recentActivity.questions, timeRange),
    },
    reports: {
      total: recentActivity.reports.length,
      byHour: groupByHour(recentActivity.reports, timeRange),
    },
    searches: {
      total: recentActivity.searches.length,
      byHour: groupByHour(recentActivity.searches, timeRange),
    },
  };

  return stats;
}

/**
 * 시간대별 그룹화
 */
function groupByHour(items: any[], timeRange: string) {
  const groups: { [key: string]: number } = {};

  items.forEach((item) => {
    const date = new Date(item.createdAt);
    let key;

    if (timeRange === '1h') {
      key = `${date.getMinutes()}`;
    } else if (timeRange === '24h') {
      key = `${date.getHours()}`;
    } else if (timeRange === '7d') {
      key = `${date.getDay()}`;
    } else {
      key = `${date.getDate()}`;
    }

    groups[key] = (groups[key] || 0) + 1;
  });

  return groups;
}

/**
 * 서버별 사용량 통계 생성
 */
function generateServerUsageStats(apiUsage: any[]) {
  const stats = {
    educational_ai: {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      successRate: 0,
    },
    teacher_report: {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      successRate: 0,
    },
  };

  apiUsage.forEach((usage) => {
    const serverType = usage.apiType.includes('teacher_report')
      ? 'teacher_report'
      : 'educational_ai';

    stats[serverType].totalRequests += usage.requestCount;
    stats[serverType].totalTokens += usage.tokensUsed;
    stats[serverType].totalCost += usage.costUsd;
  });

  // 성공률 계산
  Object.keys(stats).forEach((serverType) => {
    const serverUsages = apiUsage.filter((usage) => usage.apiType.includes(serverType));

    if (serverUsages.length > 0) {
      const successfulRequests = serverUsages.filter((usage) => usage.success).length;
      stats[serverType as keyof typeof stats].successRate =
        (successfulRequests / serverUsages.length) * 100;
    }
  });

  return stats;
}

/**
 * 성능 통계 생성
 */
function generatePerformanceStats(performanceMetrics: any[]) {
  const stats = {
    averageResponseTime: 0,
    successRate: 0,
    totalOperations: performanceMetrics.length,
    byOperationType: {} as { [key: string]: any },
  };

  if (performanceMetrics.length === 0) {
    return stats;
  }

  // 평균 응답 시간
  const totalDuration = performanceMetrics.reduce((sum, metric) => sum + metric.durationMs, 0);
  stats.averageResponseTime = totalDuration / performanceMetrics.length;

  // 성공률
  const successfulOperations = performanceMetrics.filter((metric) => metric.success).length;
  stats.successRate = (successfulOperations / performanceMetrics.length) * 100;

  // 작업 타입별 통계
  const operationTypes = [...new Set(performanceMetrics.map((metric) => metric.operationType))];

  operationTypes.forEach((operationType) => {
    const typeMetrics = performanceMetrics.filter(
      (metric) => metric.operationType === operationType,
    );

    stats.byOperationType[operationType] = {
      total: typeMetrics.length,
      averageDuration:
        typeMetrics.reduce((sum, metric) => sum + metric.durationMs, 0) / typeMetrics.length,
      successRate:
        (typeMetrics.filter((metric) => metric.success).length / typeMetrics.length) * 100,
    };
  });

  return stats;
}

/**
 * 사용자별 활동 통계 (관리자만)
 */
async function getUserActivityStats(startTime: Date) {
  const userActivity = await prisma.user.findMany({
    where: {
      role: { in: ['TEACHER', 'ADMIN'] },
      createdAt: { gte: startTime },
    },
    include: {
      _count: {
        select: {
          textbooks: true,
          aiGeneratedQuestions: true,
          teacherReports: true,
          searchQueries: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return userActivity.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    activity: {
      textbooks: user._count.textbooks,
      questions: user._count.aiGeneratedQuestions,
      reports: user._count.teacherReports,
      searches: user._count.searchQueries,
    },
    lastActive: user.updatedAt,
  }));
}

/**
 * 상세 통계 (관리자만)
 */
async function getDetailedStats(startTime: Date) {
  const [textbookStats, questionStats, reportStats, searchStats, costStats] = await Promise.all([
    // 교과서 통계
    prisma.textbook.groupBy({
      by: ['subject', 'gradeLevel'],
      _count: { id: true },
      where: { createdAt: { gte: startTime } },
    }),

    // 문제 통계
    prisma.aIGeneratedQuestion.groupBy({
      by: ['subject', 'difficulty'],
      _count: { id: true },
      _avg: { qualityScore: true },
      where: { createdAt: { gte: startTime } },
    }),

    // 리포트 통계
    prisma.teacherReport.groupBy({
      by: ['reportType', 'status'],
      _count: { id: true },
      where: { createdAt: { gte: startTime } },
    }),

    // 검색 통계
    prisma.searchQuery.groupBy({
      by: ['subject'],
      _count: { id: true },
      _avg: { searchTimeMs: true },
      where: { createdAt: { gte: startTime } },
    }),

    // 비용 통계
    prisma.aIApiUsage.groupBy({
      by: ['apiType'],
      _sum: { costUsd: true },
      _sum: { tokensUsed: true },
      where: { createdAt: { gte: startTime } },
    }),
  ]);

  return {
    textbooks: textbookStats,
    questions: questionStats,
    reports: reportStats,
    searches: searchStats,
    costs: costStats,
  };
}
