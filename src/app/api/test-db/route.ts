import { prisma } from '@/lib/core/prisma';
import { ok, withAuth } from '@/server/http/handler';
import { NextRequest } from 'next/server';

export async function GET(_request: NextRequest) {
  return withAuth(async ({ userId }) => {
    try {
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

      return new Response(
        JSON.stringify(
          ok({
            message: '데이터베이스 연결 성공',
            userCount,
            materialCount,
            materials,
            userId,
          }),
        ),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } catch (error) {
      console.error('DB 테스트 에러:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: '데이터베이스 연결 실패',
          details: error instanceof Error ? error.message : String(error),
          userId,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  });
}
