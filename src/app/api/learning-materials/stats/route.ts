import { ApiError } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { learningMaterialsService } from '@/server/services/learning-materials/learning-materials.service';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

/**
 * 학습자료 통계 조회
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    const data = await learningMaterialsService.getLearningMaterialStats();
    logger.info('학습자료 통계 조회 성공', { userId: session.user.id });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('학습자료 통계 조회 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: '학습자료 통계 조회에 실패했습니다.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
