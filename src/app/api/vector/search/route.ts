import { authOptions } from '@/lib/core/auth';
import {
  addRequestId,
  addSecurityHeaders,
  createBadRequestResponse,
  createErrorResponse,
  createSuccessResponse,
  createUnauthorizedResponse,
} from '@/lib/utils/api-response';
import { chromaClient } from '@/lib/vector/chromadb';
import { vectorService } from '@/lib/vector/embedding-service';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { z } from 'zod';

// 의미적 검색 요청 스키마
const SemanticSearchSchema = z.object({
  query: z.string().min(1, '검색어는 필수입니다'),
  type: z.enum(['problem', 'learning_material', 'all']).default('all'),
  limit: z.number().min(1).max(50).default(10),
  threshold: z.number().min(0).max(1).default(0.7),
});

// 벡터 저장 요청 스키마
const StoreVectorSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['problem', 'learning_material']),
  title: z.string().min(1),
  content: z.string().min(1),
  subject: z.string().min(1),
  difficulty: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

/**
 * 의미적 검색 API
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['STUDENT', 'TEACHER', 'ADMIN'].includes(session.user.role)) {
      return addSecurityHeaders(addRequestId(createUnauthorizedResponse(), request));
    }

    const body = await request.json();
    const parsed = SemanticSearchSchema.safeParse(body);

    if (!parsed.success) {
      return addSecurityHeaders(
        addRequestId(createBadRequestResponse('잘못된 요청 데이터입니다.'), request),
      );
    }

    const { query, type, limit, threshold } = parsed.data;

    // 의미적 검색 수행
    const results = await vectorService.semanticSearch(query, type, limit, threshold);

    const response = createSuccessResponse(
      {
        query,
        type,
        results: results.map((result) => ({
          id: result.id,
          title: result.metadata.title,
          content: result.content,
          type: result.metadata.type,
          subject: result.metadata.subject,
          difficulty: result.metadata.difficulty,
          tags: result.metadata.tags,
          score: result.score,
          createdAt: result.metadata.createdAt,
        })),
        total: results.length,
      },
      '의미적 검색이 완료되었습니다.',
    );

    return addSecurityHeaders(addRequestId(response, request));
  } catch (error) {
    console.error('의미적 검색 오류:', error);
    return addSecurityHeaders(
      addRequestId(createErrorResponse('의미적 검색 중 오류가 발생했습니다.'), request),
    );
  }
}

/**
 * 벡터 저장 API
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return addSecurityHeaders(addRequestId(createUnauthorizedResponse(), request));
    }

    const body = await request.json();
    const parsed = StoreVectorSchema.safeParse(body);

    if (!parsed.success) {
      return addSecurityHeaders(
        addRequestId(createBadRequestResponse('잘못된 요청 데이터입니다.'), request),
      );
    }

    const { id, type, title, content, subject, difficulty, tags } = parsed.data;

    // 벡터 저장
    if (type === 'problem') {
      await vectorService.storeProblemVector({
        id,
        title,
        content,
        subject,
        difficulty,
        tags,
        createdAt: new Date(),
      });
    } else {
      await vectorService.storeLearningMaterialVector({
        id,
        title,
        content,
        subject,
        difficulty,
        tags,
        createdAt: new Date(),
      });
    }

    const response = createSuccessResponse({ id, type }, '벡터가 성공적으로 저장되었습니다.');

    return addSecurityHeaders(addRequestId(response, request));
  } catch (error) {
    console.error('벡터 저장 오류:', error);
    return addSecurityHeaders(
      addRequestId(createErrorResponse('벡터 저장 중 오류가 발생했습니다.'), request),
    );
  }
}

/**
 * 벡터 삭제 API
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return addSecurityHeaders(addRequestId(createUnauthorizedResponse(), request));
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') as 'problem' | 'learning_material';

    if (!id || !type) {
      return addSecurityHeaders(
        addRequestId(createBadRequestResponse('ID와 타입이 필요합니다.'), request),
      );
    }

    if (!['problem', 'learning_material'].includes(type)) {
      return addSecurityHeaders(
        addRequestId(createBadRequestResponse('유효하지 않은 타입입니다.'), request),
      );
    }

    // 벡터 삭제
    await vectorService.deleteVector(id, type);

    const response = createSuccessResponse({ id, type }, '벡터가 성공적으로 삭제되었습니다.');

    return addSecurityHeaders(addRequestId(response, request));
  } catch (error) {
    console.error('벡터 삭제 오류:', error);
    return addSecurityHeaders(
      addRequestId(createErrorResponse('벡터 삭제 중 오류가 발생했습니다.'), request),
    );
  }
}

/**
 * 벡터 컬렉션 상태 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return addSecurityHeaders(addRequestId(createUnauthorizedResponse(), request));
    }

    // ChromaDB 상태 확인
    const isHealthy = await chromaClient.isHealthy();
    const stats = await vectorService.getCollectionStats();
    const collectionsInfo = await chromaClient.getCollectionsInfo();

    const response = createSuccessResponse(
      {
        healthy: isHealthy,
        stats,
        collections: collectionsInfo,
      },
      '벡터 데이터베이스 상태를 성공적으로 조회했습니다.',
    );

    return addSecurityHeaders(addRequestId(response, request));
  } catch (error) {
    console.error('벡터 상태 조회 오류:', error);
    return addSecurityHeaders(
      addRequestId(createErrorResponse('벡터 상태 조회 중 오류가 발생했습니다.'), request),
    );
  }
}
