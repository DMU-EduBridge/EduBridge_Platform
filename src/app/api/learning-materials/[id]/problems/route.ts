import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const AddProblemSchema = z.object({
  problemId: z.string(),
});

const RemoveProblemSchema = z.object({
  problemId: z.string(),
});

/**
 * 학습자료에 연결된 문제 목록 조회
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const materialId = params.id;

    // 학습자료 존재 확인
    const material = await prisma.learningMaterial.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return NextResponse.json({ error: '학습자료를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 연결된 문제들 조회
    const materialProblems = await prisma.learningMaterialProblem.findMany({
      where: { learningMaterialId: materialId },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            content: true,
            type: true,
            difficulty: true,
            subject: true,
            points: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const problems = materialProblems.map((mp) => mp.problem);

    logger.info('학습자료 문제 목록 조회 성공', {
      userId: session.user.id,
      materialId,
      problemCount: problems.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        materialId,
        problems,
        total: problems.length,
      },
    });
  } catch (error) {
    logger.error('학습자료 문제 목록 조회 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
      materialId: params.id,
    });
    return NextResponse.json({ error: '학습자료 문제 목록 조회에 실패했습니다.' }, { status: 500 });
  }
}

/**
 * 학습자료에 문제 추가
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const materialId = params.id;
    const body = await request.json();
    const { problemId } = AddProblemSchema.parse(body);

    // 학습자료 존재 확인
    const material = await prisma.learningMaterial.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return NextResponse.json({ error: '학습자료를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 문제 존재 확인
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json({ error: '문제를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 이미 연결된 문제인지 확인
    const existingConnection = await prisma.learningMaterialProblem.findUnique({
      where: {
        learningMaterialId_problemId: {
          learningMaterialId: materialId,
          problemId: problemId,
        },
      },
    });

    if (existingConnection) {
      return NextResponse.json({ error: '이미 연결된 문제입니다.' }, { status: 400 });
    }

    // 문제 연결 생성
    const connection = await prisma.learningMaterialProblem.create({
      data: {
        learningMaterialId: materialId,
        problemId: problemId,
      },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            content: true,
            type: true,
            difficulty: true,
            subject: true,
            points: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    logger.info('학습자료에 문제 추가 성공', {
      userId: session.user.id,
      materialId,
      problemId,
      connectionId: connection.id,
    });

    return NextResponse.json({
      success: true,
      data: connection,
    });
  } catch (error) {
    logger.error('학습자료에 문제 추가 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
      materialId: params.id,
    });
    return NextResponse.json({ error: '학습자료에 문제 추가에 실패했습니다.' }, { status: 500 });
  }
}

/**
 * 학습자료에서 문제 제거
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const materialId = params.id;
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');

    if (!problemId) {
      return NextResponse.json({ error: '문제 ID가 필요합니다.' }, { status: 400 });
    }

    // 연결 관계 존재 확인
    const connection = await prisma.learningMaterialProblem.findUnique({
      where: {
        learningMaterialId_problemId: {
          learningMaterialId: materialId,
          problemId: problemId,
        },
      },
    });

    if (!connection) {
      return NextResponse.json({ error: '연결된 문제를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 연결 관계 삭제
    await prisma.learningMaterialProblem.delete({
      where: { id: connection.id },
    });

    logger.info('학습자료에서 문제 제거 성공', {
      userId: session.user.id,
      materialId,
      problemId,
      connectionId: connection.id,
    });

    return NextResponse.json({
      success: true,
      message: '문제가 제거되었습니다.',
    });
  } catch (error) {
    logger.error('학습자료에서 문제 제거 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
      materialId: params.id,
    });
    return NextResponse.json({ error: '학습자료에서 문제 제거에 실패했습니다.' }, { status: 500 });
  }
}
