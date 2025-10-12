import { ApiError } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { UpdateLearningMaterialSchema } from '@/lib/validation/schemas';
import { learningMaterialsService } from '@/server/services/learning-materials/learning-materials.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 특정 학습자료 조회
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    const material = await learningMaterialsService.getLearningMaterialById(params.id);

    if (!material) {
      return NextResponse.json(
        {
          success: false,
          error: '학습자료를 찾을 수 없습니다.',
          code: 'NOT_FOUND',
        },
        { status: 404 },
      );
    }

    logger.info('학습자료 조회 성공', { userId: session.user.id, materialId: params.id });
    return NextResponse.json({ success: true, data: material });
  } catch (error) {
    logger.error('학습자료 조회 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: '학습자료 조회에 실패했습니다.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * 학습자료 수정
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    const body = await request.json();
    const data = UpdateLearningMaterialSchema.parse(body);

    const result = await learningMaterialsService.updateLearningMaterial(params.id, data);
    logger.info('학습자료 수정 성공', { userId: session.user.id, materialId: params.id });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error('학습자료 수정 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: '학습자료 수정에 실패했습니다.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * 학습자료 삭제
 */
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    const result = await learningMaterialsService.deleteLearningMaterial(params.id);
    logger.info('학습자료 삭제 성공', { userId: session.user.id, materialId: params.id });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error('학습자료 삭제 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: '학습자료 삭제에 실패했습니다.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
