import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { materialService } from '@/server/services/material.service';
import { STUDY_LEVELS, StudyItem, StudyLevel } from '@/types/domain/learning';
import { CreateMaterialRequest, MaterialQueryParams } from '@/types/domain/material';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// LearningMaterial을 StudyItem으로 변환하는 함수
function convertToStudyItem(material: any): StudyItem {
  // difficulty를 StudyLevel로 매핑
  const difficultyMap: Record<string, string> = {
    EASY: STUDY_LEVELS.EASY,
    MEDIUM: STUDY_LEVELS.MEDIUM,
    HARD: STUDY_LEVELS.HARD,
    EXPERT: STUDY_LEVELS.HARD,
  };

  return {
    id: material.id,
    title: material.title,
    summary: material.description || material.content?.substring(0, 100) + '...' || '',
    level: (difficultyMap[material.difficulty] || STUDY_LEVELS.MEDIUM) as StudyLevel,
    estimatedTimeMin: material.estimatedTime || 30,
    createdAt: material.createdAt,
  };
}

/**
 * 학습 자료 목록 조회 또는 개별 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // 개별 학습 자료 조회 (id 쿼리 파라미터가 있는 경우)
    const materialId = searchParams.get('id');

    if (materialId) {
      const material = await materialService.getMaterialById(materialId);

      if (!material) {
        return NextResponse.json({ error: '학습 자료를 찾을 수 없습니다.' }, { status: 404 });
      }

      // LearningMaterial을 StudyItem으로 변환
      const studyItem = convertToStudyItem(material);

      return NextResponse.json({
        success: true,
        data: studyItem,
      });
    }

    // 학습 자료 목록 조회
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;
    const subject = searchParams.get('subject') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;
    const status = searchParams.get('status') || undefined;

    const query: MaterialQueryParams = {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(subject ? { subject } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(status ? { status } : {}),
    } as MaterialQueryParams;

    const result = await materialService.getMaterials(query);

    // LearningMaterial을 StudyItem으로 변환
    const studyItems = result.materials.map(convertToStudyItem);

    return NextResponse.json({
      success: true,
      data: {
        items: studyItems,
        pagination: result.pagination,
        total: result.total,
      },
    });
  } catch (error) {
    logger.error('학습 자료 조회 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '학습 자료 조회에 실패했습니다.' }, { status: 500 });
  }
}

/**
 * 학습 자료 생성
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 선생님과 관리자만 학습 자료 생성 가능
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data: CreateMaterialRequest = body;

    const material = await materialService.createMaterial(data);

    return NextResponse.json(
      {
        success: true,
        data: material,
        message: '학습 자료가 성공적으로 생성되었습니다.',
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error('학습 자료 생성 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '학습 자료 생성에 실패했습니다.' }, { status: 500 });
  }
}
