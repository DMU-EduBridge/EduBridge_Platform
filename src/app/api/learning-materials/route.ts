import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { materialService } from '@/server/services/material.service';
import { CreateMaterialRequest, MaterialQueryParams } from '@/types/domain/material';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 학습 자료 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query: MaterialQueryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      search: searchParams.get('search') || undefined,
      subject: searchParams.get('subject') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      status: searchParams.get('status') || undefined,
    };

    const result = await materialService.getMaterials(query);

    return NextResponse.json({
      success: true,
      data: {
        materials: result.materials,
        pagination: result.pagination,
        total: result.total,
      },
    });
  } catch (error) {
    logger.error('학습 자료 목록 조회 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '학습 자료 목록 조회에 실패했습니다.' }, { status: 500 });
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
