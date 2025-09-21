import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { searchService } from '@/server';
import { SearchQueryListQueryDto, SearchQueryListResponseSchema } from '@/server/dto/search';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 검색 쿼리 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const parsed = SearchQueryListQueryDto.safeParse({
      page: Number(searchParams.get('page')) || undefined,
      limit: Number(searchParams.get('limit')) || undefined,
      userId: searchParams.get('userId') || undefined,
      subject: searchParams.get('subject') || undefined,
      gradeLevel: searchParams.get('gradeLevel') || undefined,
      search: searchParams.get('search') || undefined,
    });

    if (!parsed.success) {
      logger.error('잘못된 요청 데이터입니다.', undefined, { details: parsed.error.errors });
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const result = await searchService.getSearchQueries(parsed.data);

    // 응답 스키마 검증
    const response = SearchQueryListResponseSchema.parse({
      queries: result.queries,
      pagination: result.pagination,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('검색 쿼리 목록 조회 API 오류', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '검색 쿼리 목록 조회에 실패했습니다.' }, { status: 500 });
  }
}

/**
 * 벡터 검색 실행
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SearchQueryListQueryDto.safeParse(body);

    if (!parsed.success) {
      logger.error('잘못된 요청 데이터입니다.', undefined, { details: parsed.error.errors });
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    // 검색 쿼리 생성
    const searchQuery = await searchService.createSearchQuery(
      {
        queryText: parsed.data.search || '',
        subject: parsed.data.subject ? undefined : undefined, // subject 추출 로직 필요
        gradeLevel: undefined,
        unit: undefined,
        searchTimeMs: 0, // 실제 검색 시간 측정 필요
      },
      session.user.id,
    );

    // 벡터 검색 실행
    const searchResults = await searchService.getSearchQueries(parsed.data);

    // 검색 결과 저장
    for (let i = 0; i < searchResults.queries.length; i++) {
      const result = searchResults.queries[i];
      await searchService.createSearchResult({
        queryId: searchQuery.id,
        chunkId: result.id,
        similarityScore: 0.8, // 실제 유사도 점수 계산 필요
        rankPosition: i + 1,
      });
    }

    return NextResponse.json({
      query: searchQuery,
      results: searchResults.queries,
      totalResults: searchResults.queries.length,
    });
  } catch (error) {
    logger.error('벡터 검색 API 오류', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '벡터 검색에 실패했습니다.' }, { status: 500 });
  }
}
