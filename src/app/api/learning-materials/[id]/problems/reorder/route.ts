import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 학습자료 내 문제 순서 변경
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { problemIds } = await request.json();
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return NextResponse.json({ error: 'problemIds array is required' }, { status: 400 });
    }

    // 학습자료 존재 확인
    const material = await prisma.learningMaterial.findUnique({
      where: { id: params.id },
    });

    if (!material) {
      return NextResponse.json({ error: 'Learning material not found' }, { status: 404 });
    }

    // 트랜잭션으로 순서 업데이트
    await prisma.$transaction(
      problemIds.map((problemId: string, index: number) =>
        prisma.learningMaterialProblem.updateMany({
          where: {
            learningMaterialId: params.id,
            problemId: problemId,
          },
          data: {
            order: index,
          },
        }),
      ),
    );

    logger.info('문제 순서 변경 성공', {
      userId: session.user.id,
      materialId: params.id,
      problemCount: problemIds.length,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('문제 순서 변경 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
      materialId: params.id,
    });
    return NextResponse.json({ error: '문제 순서 변경에 실패했습니다.' }, { status: 500 });
  }
}
