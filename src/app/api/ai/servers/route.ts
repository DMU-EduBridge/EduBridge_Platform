import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// AI 서버 상태 확인 스키마
const ServerStatusSchema = z.object({
  serverName: z.enum(['educational_ai', 'teacher_report', 'all']).default('all'),
  includeMetrics: z.boolean().default(false),
});

// AI 서버 동기화 스키마
const ServerSyncSchema = z.object({
  serverName: z.enum(['educational_ai', 'teacher_report', 'all']),
  syncType: z.enum(['data_sync', 'health_check', 'report_generation']).default('health_check'),
  forceSync: z.boolean().default(false),
});

/**
 * AI 서버 상태 확인 API
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = {
      serverName: searchParams.get('serverName') || 'all',
      includeMetrics: searchParams.get('includeMetrics') === 'true',
    };

    const parsed = ServerStatusSchema.safeParse(query);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { serverName, includeMetrics } = parsed.data;

    // AI 서버 상태 확인
    const serverStatuses = await checkAIServerStatus(serverName);

    // 최근 동기화 기록 조회
    const recentSyncs = await prisma.aIServerSync.findMany({
      where: serverName !== 'all' ? { serverName } : {},
      take: 10,
      orderBy: { startTime: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    let metrics = null;
    if (includeMetrics) {
      // 통계 데이터 조회
      const [
        totalTextbooks,
        totalQuestions,
        totalReports,
        totalSearches,
        recentApiUsage,
        performanceMetrics,
      ] = await Promise.all([
        prisma.textbook.count(),
        prisma.aIGeneratedQuestion.count(),
        prisma.teacherReport.count(),
        prisma.searchQuery.count(),
        prisma.aIApiUsage.findMany({
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: {
            apiType: true,
            tokensUsed: true,
            costUsd: true,
            success: true,
            createdAt: true,
          },
        }),
        prisma.aIPerformanceMetric.findMany({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 최근 24시간
            },
          },
          select: {
            operationType: true,
            durationMs: true,
            success: true,
            createdAt: true,
          },
        }),
      ]);

      metrics = {
        totals: {
          textbooks: totalTextbooks,
          questions: totalQuestions,
          reports: totalReports,
          searches: totalSearches,
        },
        recentActivity: {
          apiUsage: recentApiUsage,
          performance: performanceMetrics,
        },
        costSummary: {
          totalCost: recentApiUsage.reduce((sum, usage) => sum + usage.costUsd, 0),
          totalTokens: recentApiUsage.reduce((sum, usage) => sum + usage.tokensUsed, 0),
        },
      };
    }

    return NextResponse.json({
      success: true,
      servers: serverStatuses,
      recentSyncs,
      metrics,
    });
  } catch (error) {
    console.error('AI 서버 상태 확인 오류:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'AI 서버 상태 확인 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}

/**
 * AI 서버 동기화 API
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 관리자만 동기화 가능
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = ServerSyncSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { serverName, syncType, forceSync } = parsed.data;

    const startTime = Date.now();

    // 동기화 작업 시작
    const syncRecord = await prisma.aIServerSync.create({
      data: {
        serverName,
        syncType,
        status: 'pending',
        startTime: new Date(),
        userId: session.user.id,
        metadata: JSON.stringify({ forceSync }),
      },
    });

    try {
      let result;

      if (serverName === 'all') {
        // 모든 서버 동기화
        result = await syncAllServers(syncType, forceSync);
      } else {
        // 특정 서버 동기화
        result = await syncSpecificServer(serverName, syncType, forceSync);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 동기화 완료 상태 업데이트
      await prisma.aIServerSync.update({
        where: { id: syncRecord.id },
        data: {
          status: 'success',
          endTime: new Date(),
          durationMs: duration,
          recordsProcessed: result.recordsProcessed,
          recordsSynced: result.recordsSynced,
          metadata: JSON.stringify({
            ...JSON.parse(syncRecord.metadata),
            result: result.summary,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `${serverName} 서버 동기화가 완료되었습니다.`,
        syncId: syncRecord.id,
        result: result.summary,
        durationMs: duration,
      });
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 동기화 실패 상태 업데이트
      await prisma.aIServerSync.update({
        where: { id: syncRecord.id },
        data: {
          status: 'failed',
          endTime: new Date(),
          durationMs: duration,
          errors: JSON.stringify([error instanceof Error ? error.message : '알 수 없는 오류']),
        },
      });

      throw error;
    }
  } catch (error) {
    console.error('AI 서버 동기화 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI 서버 동기화 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * AI 서버 상태 확인 함수
 */
async function checkAIServerStatus(serverName: string) {
  const servers = serverName === 'all' ? ['educational_ai', 'teacher_report'] : [serverName];

  const serverStatuses = [];

  for (const server of servers) {
    const config = getServerConfig(server);

    try {
      const startTime = Date.now();

      // 실제로는 각 서버의 health check 엔드포인트를 호출
      const response = await fetch(`${config.url}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
        },
        signal: AbortSignal.timeout(5000), // 5초 타임아웃
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();

        // 서버 상태 저장
        await prisma.aIServerStatus.upsert({
          where: { serverName: server },
          update: {
            status: 'healthy',
            responseTimeMs: responseTime,
            version: data.version || 'unknown',
            lastChecked: new Date(),
            errorMessage: null,
            services: JSON.stringify(data.services || {}),
          },
          create: {
            serverName: server,
            serverUrl: config.url,
            status: 'healthy',
            responseTimeMs: responseTime,
            version: data.version || 'unknown',
            lastChecked: new Date(),
            services: JSON.stringify(data.services || {}),
          },
        });

        serverStatuses.push({
          serverName: server,
          status: 'healthy',
          responseTimeMs: responseTime,
          version: data.version || 'unknown',
          services: data.services || {},
          lastChecked: new Date().toISOString(),
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

      // 서버 상태 저장 (오류)
      await prisma.aIServerStatus.upsert({
        where: { serverName: server },
        update: {
          status: 'unhealthy',
          lastChecked: new Date(),
          errorMessage,
        },
        create: {
          serverName: server,
          serverUrl: config.url,
          status: 'unhealthy',
          lastChecked: new Date(),
          errorMessage,
        },
      });

      serverStatuses.push({
        serverName: server,
        status: 'unhealthy',
        errorMessage,
        lastChecked: new Date().toISOString(),
      });
    }
  }

  return serverStatuses;
}

/**
 * 모든 서버 동기화
 */
async function syncAllServers(syncType: string, forceSync: boolean) {
  const results = {
    educational_ai: await syncSpecificServer('educational_ai', syncType, forceSync),
    teacher_report: await syncSpecificServer('teacher_report', syncType, forceSync),
  };

  return {
    recordsProcessed:
      results.educational_ai.recordsProcessed + results.teacher_report.recordsProcessed,
    recordsSynced: results.educational_ai.recordsSynced + results.teacher_report.recordsSynced,
    summary: {
      educational_ai: results.educational_ai.summary,
      teacher_report: results.teacher_report.summary,
    },
  };
}

/**
 * 특정 서버 동기화
 */
async function syncSpecificServer(serverName: string, syncType: string, forceSync: boolean) {
  const config = getServerConfig(serverName);

  switch (syncType) {
    case 'health_check':
      return await performHealthCheck(serverName, config);

    case 'data_sync':
      return await performDataSync(serverName, config, forceSync);

    case 'report_generation':
      return await performReportGeneration(serverName, config);

    default:
      throw new Error(`지원하지 않는 동기화 타입: ${syncType}`);
  }
}

/**
 * 헬스 체크 수행
 */
async function performHealthCheck(serverName: string, config: any) {
  try {
    const response = await fetch(`${config.url}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        recordsProcessed: 1,
        recordsSynced: 1,
        summary: {
          status: 'healthy',
          version: data.version,
          services: data.services,
        },
      };
    } else {
      throw new Error(`Health check failed: ${response.status}`);
    }
  } catch (error) {
    return {
      recordsProcessed: 1,
      recordsSynced: 0,
      summary: {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
    };
  }
}

/**
 * 데이터 동기화 수행
 */
async function performDataSync(serverName: string, config: any, forceSync: boolean) {
  let recordsProcessed = 0;
  let recordsSynced = 0;

  if (serverName === 'educational_ai') {
    // Educational AI 서버 데이터 동기화
    const textbooks = await prisma.textbook.findMany({
      where: forceSync ? {} : { processingStatus: 'pending' },
    });

    recordsProcessed = textbooks.length;

    for (const textbook of textbooks) {
      try {
        // 실제로는 AI 서버에 교과서 데이터를 전송하고 처리 결과를 받아옴
        await new Promise((resolve) => setTimeout(resolve, 100)); // 시뮬레이션

        await prisma.textbook.update({
          where: { id: textbook.id },
          data: { processingStatus: 'completed' },
        });

        recordsSynced++;
      } catch (error) {
        console.error(`교과서 ${textbook.id} 동기화 실패:`, error);
      }
    }
  } else if (serverName === 'teacher_report') {
    // Teacher Report 서버 데이터 동기화
    const reports = await prisma.teacherReport.findMany({
      where: forceSync ? {} : { status: 'draft' },
    });

    recordsProcessed = reports.length;

    for (const report of reports) {
      try {
        // 실제로는 Teacher Report 서버에 리포트 데이터를 전송
        await new Promise((resolve) => setTimeout(resolve, 100)); // 시뮬레이션

        await prisma.teacherReport.update({
          where: { id: report.id },
          data: { status: 'published' },
        });

        recordsSynced++;
      } catch (error) {
        console.error(`리포트 ${report.id} 동기화 실패:`, error);
      }
    }
  }

  return {
    recordsProcessed,
    recordsSynced,
    summary: {
      serverName,
      syncType: 'data_sync',
      recordsProcessed,
      recordsSynced,
      successRate: recordsProcessed > 0 ? (recordsSynced / recordsProcessed) * 100 : 0,
    },
  };
}

/**
 * 리포트 생성 수행
 */
async function performReportGeneration(serverName: string, config: any) {
  // 실제로는 각 서버에서 리포트 생성 작업을 수행
  return {
    recordsProcessed: 1,
    recordsSynced: 1,
    summary: {
      serverName,
      syncType: 'report_generation',
      status: 'completed',
    },
  };
}

/**
 * 서버 설정 가져오기
 */
function getServerConfig(serverName: string) {
  const configs = {
    educational_ai: {
      url: process.env.EDUCATIONAL_AI_URL || 'http://localhost:8000',
      apiKey: process.env.OPENAI_API_KEY, // 공통 OpenAI API 키 사용
    },
    teacher_report: {
      url: process.env.TEACHER_REPORT_URL || 'http://localhost:8001',
      apiKey: process.env.OPENAI_API_KEY, // 공통 OpenAI API 키 사용
    },
  };

  return configs[serverName as keyof typeof configs] || configs.educational_ai;
}
