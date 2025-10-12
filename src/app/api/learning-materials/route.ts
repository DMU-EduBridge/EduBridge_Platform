import { ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import {
  CreateLearningMaterialSchema,
  LearningMaterialsQuerySchema,
} from '@/lib/validation/schemas';
import { learningMaterialsService } from '@/server/services/learning-materials/learning-materials.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 학습자료 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    logger.info('학습자료 목록 조회 성공', {
      userId: session.user.id,
      count: (result as any).materials.length,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error('학습자료 목록 조회 실패', {
      error: error instanceof Error ? error.message : String(error),
    } as any);
    return NextResponse.json(
      {
        success: false,
        error: '학습자료 목록 조회에 실패했습니다.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * 학습자료 생성
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = CreateLearningMaterialSchema.parse(body);

    const result = await learningMaterialsService.createLearningMaterial(session.user.id, data);
    logger.info('학습자료 생성 성공', { userId: session.user.id, materialId: result.id });
    return NextResponse.json(ApiSuccess.ok(result), { status: 201 });
  } catch (error) {
    logger.error('학습자료 생성 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
