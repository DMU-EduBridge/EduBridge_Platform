import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// AI 서버 동기화 요청 스키마
const SyncRequestSchema = z.object({
  textbookId: z.string().optional(),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  forceSync: z.boolean().default(false),
});

// AI 서버 상태 확인 스키마
const HealthCheckSchema = z.object({
  includeMetrics: z.boolean().default(false),
});

/**
 * AI 서버와 데이터 동기화 API
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 관리자만 동기화 가능
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = SyncRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { textbookId, subject, gradeLevel, forceSync } = parsed.data;

    const startTime = Date.now();

    // 동기화할 교과서 조회
    const where: any = {};
    if (textbookId) where.id = textbookId;
    if (subject) where.subject = subject;
    if (gradeLevel) where.gradeLevel = gradeLevel;
    if (!forceSync) where.processingStatus = 'pending';

    const textbooks = await prisma.textbook.findMany({
      where,
      include: {
        chunks: true,
        problems: true,
      },
    });

    if (textbooks.length === 0) {
      return NextResponse.json({
        success: true,
        message: '동기화할 교과서가 없습니다.',
        syncedTextbooks: 0,
        syncedChunks: 0,
        syncedQuestions: 0,
      });
    }

    // AI 서버와 동기화 시뮬레이션
    let syncedChunks = 0;
    let syncedQuestions = 0;
    const errors: string[] = [];

    for (const textbook of textbooks) {
      try {
        // 1. 교과서 처리 상태 업데이트
        await prisma.textbook.update({
          where: { id: textbook.id },
          data: { processingStatus: 'PROCESSING' },
        });

        // 2. 청크들을 AI 서버에 전송하여 임베딩 생성 (시뮬레이션)
        for (const chunk of textbook.chunks) {
          // 실제로는 AI 서버에 청크를 전송하고 임베딩 ID를 받아옴
          const embeddingId = `embedding-${chunk.id}-${Date.now()}`;

          await prisma.documentChunk.update({
            where: { id: chunk.id },
            data: { embeddingId },
          });

          syncedChunks++;
        }

        // 3. AI 서버에서 생성된 문제들을 동기화 (시뮬레이션)
        const aiGeneratedProblems = await prisma.problem.findMany({
          where: { textbookId: textbook.id },
        });

        // 실제로는 AI 서버에서 새로운 문제들을 가져와서 저장
        // 여기서는 기존 문제들의 메타데이터를 업데이트하는 것으로 시뮬레이션
        for (const question of aiGeneratedProblems) {
          await prisma.problem.update({
            where: { id: question.id },
            data: {
              qualityScore: Math.random() * 0.3 + 0.7,
              updatedAt: new Date(),
            },
          });

          syncedQuestions++;
        }

        // 4. 교과서 처리 완료 상태로 업데이트
        await prisma.textbook.update({
          where: { id: textbook.id },
          data: {
            processingStatus: 'COMPLETED',
            totalChunks: textbook.chunks.length,
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        const errorMessage = `교과서 ${textbook.title} 동기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
        errors.push(errorMessage);

        // 오류 발생 시 상태 업데이트
        await prisma.textbook.update({
          where: { id: textbook.id },
          data: {
            processingStatus: 'FAILED',
            errorMessage: errorMessage,
            updatedAt: new Date(),
          },
        });
      }
    }

    const syncTime = Date.now() - startTime;

    // // 성능 지표 기록
    // await prisma.aiPerformanceMetric.create({
    //   data: {
    //     operationType: 'ai_server_sync',
    //     durationMs: syncTime,
    //     success: errors.length === 0,
    //     errorMessage: errors.length > 0 ? errors.join('; ') : null,
    //     metadata: JSON.stringify({
    //       textbooksProcessed: textbooks.length,
    //       syncedChunks,
    //       syncedQuestions,
    //       errors: errors.length,
    //     }),
    //     userId: session.user.id,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: `동기화가 완료되었습니다. ${textbooks.length}개 교과서 처리됨`,
      results: {
        syncedTextbooks: textbooks.length - errors.length,
        syncedChunks,
        syncedQuestions,
        errors: errors.length,
        syncTimeMs: syncTime,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('AI 서버 동기화 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI 서버 동기화 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

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
      includeMetrics: searchParams.get('includeMetrics') === 'true',
    };

    const parsed = HealthCheckSchema.safeParse(query);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { includeMetrics } = parsed.data;

    // AI 서버 상태 확인 (시뮬레이션)
    const aiServerStatus = {
      status: 'healthy',
      responseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
      version: '1.0.0',
      services: {
        embedding: 'healthy',
        questionGeneration: 'healthy',
        vectorSearch: 'healthy',
      },
      lastChecked: new Date().toISOString(),
    };

    let metrics = null;
    if (includeMetrics) {
      // 통계 데이터 조회
      const [totalTextbooks, totalChunks, totalQuestions, totalSearches] = await Promise.all([
        prisma.textbook.count(),
        prisma.documentChunk.count(),
        prisma.problem.count({ where: { isAIGenerated: true } }),
        prisma.searchQuery.count(),
      ]);

      metrics = {
        totals: {
          textbooks: totalTextbooks,
          chunks: totalChunks,
          questions: totalQuestions,
          searches: totalSearches,
        },
        recentActivity: { apiUsage: [], performance: [] },
        costSummary: {
          totalCost: 0,
          totalTokens: 0,
        },
      };
    }

    return NextResponse.json({
      success: true,
      aiServer: aiServerStatus,
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
