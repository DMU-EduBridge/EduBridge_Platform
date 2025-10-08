import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { materialService } from '@/server/services/material.service';
import { STUDY_LEVELS, StudyItem } from '@/types/domain/learning';
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
  };

  return {
    id: material.id,
    title: material.title,
    summary: material.description || material.summary || '',
    level: (difficultyMap[material.difficulty] || STUDY_LEVELS.MEDIUM) as any,
    estimatedTimeMin: material.estimatedTimeMin || 30,
    createdAt: material.createdAt,
  };
}

/**
 * 개별 학습 자료 조회
 */
export async function GET(request: NextRequest, { params }: { params: { studyId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const material = await materialService.getMaterialById(params.studyId);

    if (!material) {
      return NextResponse.json({ error: '학습 자료를 찾을 수 없습니다.' }, { status: 404 });
    }

    // LearningMaterial을 StudyItem으로 변환
    const studyItem = convertToStudyItem(material);

    logger.info('학습 자료 조회 완료', {
      materialId: params.studyId,
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: studyItem,
    });
  } catch (error) {
    logger.error('학습 자료 조회 실패', undefined, {
      materialId: params.studyId,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '학습 자료 조회에 실패했습니다.' }, { status: 500 });
  }
}

/**
 * 학습 자료 수정
 */
export async function PUT(request: NextRequest, { params }: { params: { studyId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 선생님과 관리자만 학습 자료 수정 가능
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const material = await materialService.updateMaterial(params.studyId, body);

    return NextResponse.json({
      success: true,
      data: material,
      message: '학습 자료가 성공적으로 수정되었습니다.',
    });
  } catch (error) {
    logger.error('학습 자료 수정 실패', undefined, {
      materialId: params.studyId,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '학습 자료 수정에 실패했습니다.' }, { status: 500 });
  }
}

/**
 * 학습 자료 삭제
 */
export async function DELETE(request: NextRequest, { params }: { params: { studyId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 선생님과 관리자만 학습 자료 삭제 가능
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await materialService.deleteMaterial(params.studyId);

    return NextResponse.json({
      success: true,
      message: '학습 자료가 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    logger.error('학습 자료 삭제 실패', undefined, {
      materialId: params.studyId,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '학습 자료 삭제에 실패했습니다.' }, { status: 500 });
  }
}
