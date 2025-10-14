import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { ok } from '@/server/http/handler';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Prisma 클라이언트 연결 테스트
    const userCount = await prisma.user.count();

    // 2. LearningMaterial 테이블 존재 확인
    const materialCount = await prisma.learningMaterial.count();

    // 3. 간단한 쿼리 테스트
    const materials = await prisma.learningMaterial.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        subject: true,
        difficulty: true,
        isActive: true,
      },
    });

    return NextResponse.json(
      ok({
        message: '데이터베이스 연결 성공',
        userCount,
        materialCount,
        materials,
        userId: session.user.id,
      }),
    );
  } catch (error) {
    console.error('DB 테스트 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: '데이터베이스 연결 실패',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
