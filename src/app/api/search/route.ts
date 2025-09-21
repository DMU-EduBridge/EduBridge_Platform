import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 검색 요청 스키마
const SearchSchema = z.object({
  queryText: z.string().min(1, '검색어를 입력해주세요'),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  unit: z.string().optional(),
  limit: z.number().min(1).max(50).default(10),
  similarityThreshold: z.number().min(0).max(1).default(0.7),
});

// 검색 히스토리 조회 스키마
const SearchHistorySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
});

/**
 * RAG 컨텍스트 검색 API
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SearchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { queryText, subject, gradeLevel, unit, limit, similarityThreshold } = parsed.data;

    const startTime = Date.now();

    // 실제 구현에서는 벡터 검색을 수행하지만, 여기서는 더미 데이터로 시뮬레이션
    // 실제로는 ChromaDB나 다른 벡터 DB에서 유사도 검색을 수행

    // 교과서 필터 조건
    const textbookWhere: any = {};
    if (subject) textbookWhere.subject = subject;
    if (gradeLevel) textbookWhere.gradeLevel = gradeLevel;

    // 검색할 청크들 조회
    const chunks = await prisma.documentChunk.findMany({
      where: {
        textbook: textbookWhere,
      },
      include: {
        textbook: {
          select: {
            id: true,
            title: true,
            subject: true,
            gradeLevel: true,
            unit: true,
          },
        },
      },
      take: 100, // 검색할 최대 청크 수
    });

    // 더미 유사도 점수 생성 (실제로는 벡터 검색 결과)
    const searchResults = chunks
      .map((chunk, index) => ({
        chunkId: chunk.id,
        similarityScore: Math.random() * 0.3 + similarityThreshold, // 임계값 이상의 점수
        rankPosition: index + 1,
        content: chunk.content,
        textbook: chunk.textbook,
      }))
      .filter((result) => result.similarityScore >= similarityThreshold)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);

    const searchTime = Date.now() - startTime;

    // 검색 쿼리 저장
    const searchQuery = await prisma.searchQuery.create({
      data: {
        queryText,
        subject: subject || null,
        gradeLevel: gradeLevel || null,
        unit: unit || null,
        resultsCount: searchResults.length,
        searchTimeMs: searchTime,
        userId: session.user.id,
        sessionId: `session-${Date.now()}`,
      },
    });

    // 검색 결과 저장
    for (const result of searchResults) {
      await prisma.searchResult.create({
        data: {
          queryId: searchQuery.id,
          chunkId: result.chunkId,
          similarityScore: result.similarityScore,
          rankPosition: result.rankPosition,
        },
      });
    }

    // API 사용량 기록
    await prisma.aIApiUsage.create({
      data: {
        userId: session.user.id,
        apiType: 'vector_search',
        modelName: 'text-embedding-ada-002',
        tokensUsed: queryText.length * 2, // 대략적인 토큰 수
        costUsd: 0.0001, // 검색 비용
        requestCount: 1,
        responseTimeMs: searchTime,
        success: true,
      },
    });

    // 성능 지표 기록
    await prisma.aIPerformanceMetric.create({
      data: {
        operationType: 'vector_search',
        durationMs: searchTime,
        success: true,
        metadata: JSON.stringify({
          queryText,
          resultsCount: searchResults.length,
          similarityThreshold,
          subject,
          gradeLevel,
        }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      query: {
        id: searchQuery.id,
        text: queryText,
        filters: { subject, gradeLevel, unit },
      },
      results: searchResults.map((result) => ({
        chunkId: result.chunkId,
        content: result.content,
        similarityScore: result.similarityScore,
        rankPosition: result.rankPosition,
        textbook: result.textbook,
      })),
      metadata: {
        totalResults: searchResults.length,
        searchTimeMs: searchTime,
        similarityThreshold,
      },
    });
  } catch (error) {
    console.error('검색 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * 검색 히스토리 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      subject: searchParams.get('subject') || undefined,
      gradeLevel: searchParams.get('gradeLevel') || undefined,
    };

    const parsed = SearchHistorySchema.safeParse(query);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { page, limit, subject, gradeLevel } = parsed.data;
    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {
      userId: session.user.id,
    };

    if (subject) where.subject = subject;
    if (gradeLevel) where.gradeLevel = gradeLevel;

    // 검색 히스토리 조회
    const [queries, total] = await Promise.all([
      prisma.searchQuery.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          results: {
            include: {
              chunk: {
                include: {
                  textbook: {
                    select: {
                      id: true,
                      title: true,
                      subject: true,
                      gradeLevel: true,
                    },
                  },
                },
              },
            },
            take: 3, // 각 쿼리의 상위 3개 결과만
            orderBy: { rankPosition: 'asc' },
          },
        },
      }),
      prisma.searchQuery.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      queries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('검색 히스토리 조회 오류:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : '검색 히스토리 조회 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
