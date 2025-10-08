import { logger } from '@/lib/monitoring';
import { UpdateLearningMaterialSchema } from '@/lib/validation/schemas';
import { ok, withAuth } from '@/server/http/handler';
import { learningMaterialsService } from '@/server/services/learning-materials/learning-materials.service';
import { NextRequest } from 'next/server';

/**
 * 특정 학습자료 조회
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(async ({ userId }) => {
    const material = await learningMaterialsService.getLearningMaterialById(params.id);

    if (!material) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '학습자료를 찾을 수 없습니다.',
          code: 'NOT_FOUND',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    logger.info('학습자료 조회 성공', { userId, materialId: params.id });
    return new Response(JSON.stringify(ok(material)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

/**
 * 학습자료 수정
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(async ({ userId }) => {
    const body = await request.json();
    const data = UpdateLearningMaterialSchema.parse(body);

    const result = await learningMaterialsService.updateLearningMaterial(params.id, data);
    logger.info('학습자료 수정 성공', { userId, materialId: params.id });
    return new Response(JSON.stringify(ok(result)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

/**
 * 학습자료 삭제
 */
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(async ({ userId }) => {
    const result = await learningMaterialsService.deleteLearningMaterial(params.id);
    logger.info('학습자료 삭제 성공', { userId, materialId: params.id });
    return new Response(JSON.stringify(ok(result)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
