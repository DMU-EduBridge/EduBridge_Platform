import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 학습자료에 여러 문제 일괄 추가
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // 이미 연결된 문제들 확인
    const existingConnections = await prisma.learningMaterialProblem.findMany({
      where: {
        learningMaterialId: params.id,
        problemId: { in: problemIds },
      },
      select: { problemId: true },
    });

    const existingProblemIds = existingConnections.map((c) => c.problemId);
    const newProblemIds = problemIds.filter((id) => !existingProblemIds.includes(id));

    if (newProblemIds.length === 0) {
      return NextResponse.json(
        {
          error: 'All problems are already linked to this material',
          existing: existingProblemIds,
        },
        { status: 409 },
      );
    }

    // 현재 최대 순서 값 조회
    const maxOrder = await prisma.learningMaterialProblem.findFirst({
      where: { learningMaterialId: params.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const startOrder = (maxOrder?.order ?? -1) + 1;

    // 새 문제들 일괄 추가
    const results = await prisma.learningMaterialProblem.createMany({
      data: newProblemIds.map((problemId, index) => ({
        learningMaterialId: params.id,
        problemId,
        order: startOrder + index,
      })),
    });

    logger.info('문제 일괄 추가 성공', {
      userId: session.user.id,
      materialId: params.id,
      addedCount: results.count,
      skippedCount: existingProblemIds.length,
    });

    return NextResponse.json(
      {
        success: true,
        added: results.count,
        skipped: existingProblemIds.length,
        data: results,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error('문제 일괄 추가 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
      materialId: params.id,
    });
    return NextResponse.json({ error: '문제 일괄 추가에 실패했습니다.' }, { status: 500 });
  }
}
