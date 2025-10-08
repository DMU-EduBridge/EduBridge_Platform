import { logger } from '@/lib/monitoring';
import {
  CreateLearningMaterialSchema,
  LearningMaterialsQuerySchema,
} from '@/lib/validation/schemas';
import { ok, withAuth } from '@/server/http/handler';
import { learningMaterialsService } from '@/server/services/learning-materials/learning-materials.service';
import { NextRequest } from 'next/server';

/**
 * 학습자료 목록 조회
 */
export async function GET(request: NextRequest) {
  return withAuth(async ({ userId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = LearningMaterialsQuerySchema.parse({
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '20',
        subject: searchParams.get('subject'),
        difficulty: searchParams.get('difficulty'),
        search: searchParams.get('search'),
        isActive:
          searchParams.get('isActive') === 'true'
            ? true
            : searchParams.get('isActive') === 'false'
              ? false
              : undefined,
      });

      const result = await learningMaterialsService.getLearningMaterials(query);
      logger.info('학습자료 목록 조회 성공', { userId, count: result.materials.length });
      return new Response(JSON.stringify(ok(result)), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      logger.error('학습자료 목록 조회 실패', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      } as any);
      return new Response(
        JSON.stringify({
          success: false,
          error: '학습자료 목록 조회에 실패했습니다.',
          details: error instanceof Error ? error.message : String(error),
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  });
}

/**
 * 학습자료 생성
 */
export async function POST(request: NextRequest) {
  return withAuth(async ({ userId }) => {
    const body = await request.json();
    const data = CreateLearningMaterialSchema.parse(body);

    const result = await learningMaterialsService.createLearningMaterial(userId, data);
    logger.info('학습자료 생성 성공', { userId, materialId: result.id });
    return new Response(JSON.stringify(ok(result)), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
