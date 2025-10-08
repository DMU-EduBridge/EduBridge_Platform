import { logger } from '@/lib/monitoring';
import { ok, withAuth } from '@/server/http/handler';
import { learningMaterialsService } from '@/server/services/learning-materials/learning-materials.service';

/**
 * 학습자료 통계 조회
 */
export async function GET() {
  return withAuth(async ({ userId }) => {
    const data = await learningMaterialsService.getLearningMaterialStats();
    logger.info('학습자료 통계 조회 성공', { userId });
    return new Response(JSON.stringify(ok(data)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
