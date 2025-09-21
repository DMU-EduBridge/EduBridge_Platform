import { authOptions } from '@/lib/core/auth';
import {
  addRequestId,
  addSecurityHeaders,
  createBadRequestResponse,
  createErrorResponse,
  createSuccessResponse,
  createUnauthorizedResponse,
} from '@/lib/utils/api-response';
import { vectorService } from '@/lib/vector/embedding-service';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { z } from 'zod';

// 벡터 동기화 요청 스키마
const SyncVectorSchema = z.object({
  type: z.enum(['problem', 'learning_material', 'all']),
  ids: z.array(z.string()).optional(),
});

/**
 * 벡터 동기화 API
 * 기존 데이터베이스의 문제/학습자료를 ChromaDB에 벡터로 변환하여 저장
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['ADMIN'].includes(session.user.role)) {
      return addSecurityHeaders(addRequestId(createUnauthorizedResponse(), request));
    }

    const body = await request.json();
    const parsed = SyncVectorSchema.safeParse(body);

    if (!parsed.success) {
      return addSecurityHeaders(
        addRequestId(createBadRequestResponse('잘못된 요청 데이터입니다.'), request),
      );
    }

    const { type, ids } = parsed.data;

    // 동적 import로 Prisma 클라이언트 가져오기
    const { prisma } = await import('@/lib/core/prisma');

    const results = {
      problems: 0,
      learningMaterials: 0,
      errors: [] as string[],
    };

    // 문제 동기화
    if (type === 'problem' || type === 'all') {
      try {
        const problems = await prisma.problem.findMany({
          where: {
            isActive: true,
            deletedAt: null,
            ...(ids && { id: { in: ids } }),
          },
          select: {
            id: true,
            title: true,
            content: true,
            subject: true,
            difficulty: true,
            tags: true,
            createdAt: true,
          },
        });

        for (const problem of problems) {
          try {
            await vectorService.storeProblemVector({
              id: problem.id,
              title: problem.title,
              content: problem.content,
              subject: problem.subject,
              difficulty: problem.difficulty,
              tags: problem.tags
                ? (problem.tags as string).split(',').map((tag: string) => tag.trim())
                : [],
              createdAt: problem.createdAt,
            });
            results.problems++;
          } catch (error) {
            results.errors.push(`문제 ${problem.id} 동기화 실패: ${error}`);
          }
        }
      } catch (error) {
        results.errors.push(`문제 동기화 실패: ${error}`);
      }
    }

    // 학습자료 동기화
    if (type === 'learning_material' || type === 'all') {
      try {
        const materials = await prisma.learningMaterial.findMany({
          where: {
            isActive: true,
            deletedAt: null,
            ...(ids && { id: { in: ids } }),
          },
          select: {
            id: true,
            title: true,
            content: true,
            subject: true,
            difficulty: true,
            createdAt: true,
          },
        });

        for (const material of materials) {
          try {
            await vectorService.storeLearningMaterialVector({
              id: material.id,
              title: material.title,
              content: material.content,
              subject: material.subject,
              difficulty: material.difficulty,
              createdAt: material.createdAt,
            });
            results.learningMaterials++;
          } catch (error) {
            results.errors.push(`학습자료 ${material.id} 동기화 실패: ${error}`);
          }
        }
      } catch (error) {
        results.errors.push(`학습자료 동기화 실패: ${error}`);
      }
    }

    const response = createSuccessResponse(
      results,
      `벡터 동기화가 완료되었습니다. 문제: ${results.problems}개, 학습자료: ${results.learningMaterials}개`,
    );

    return addSecurityHeaders(addRequestId(response, request));
  } catch (error) {
    console.error('벡터 동기화 오류:', error);
    return addSecurityHeaders(
      addRequestId(createErrorResponse('벡터 동기화 중 오류가 발생했습니다.'), request),
    );
  }
}

/**
 * 벡터 동기화 상태 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['ADMIN'].includes(session.user.role)) {
      return addSecurityHeaders(addRequestId(createUnauthorizedResponse(), request));
    }

    // 동적 import로 Prisma 클라이언트 가져오기
    const { prisma } = await import('@/lib/core/prisma');

    // 데이터베이스 통계
    const [problemCount, materialCount] = await Promise.all([
      prisma.problem.count({
        where: { isActive: true, deletedAt: null },
      }),
      prisma.learningMaterial.count({
        where: { isActive: true, deletedAt: null },
      }),
    ]);

    // 벡터 통계
    const vectorStats = await vectorService.getCollectionStats();

    const response = createSuccessResponse(
      {
        database: {
          problems: problemCount,
          learningMaterials: materialCount,
          total: problemCount + materialCount,
        },
        vectors: vectorStats,
        syncStatus: {
          problemsSynced: vectorStats.problems,
          materialsSynced: vectorStats.learningMaterials,
          totalSynced: vectorStats.total,
          problemsPending: problemCount - vectorStats.problems,
          materialsPending: materialCount - vectorStats.learningMaterials,
        },
      },
      '벡터 동기화 상태를 성공적으로 조회했습니다.',
    );

    return addSecurityHeaders(addRequestId(response, request));
  } catch (error) {
    console.error('벡터 동기화 상태 조회 오류:', error);
    return addSecurityHeaders(
      addRequestId(createErrorResponse('벡터 동기화 상태 조회 중 오류가 발생했습니다.'), request),
    );
  }
}
