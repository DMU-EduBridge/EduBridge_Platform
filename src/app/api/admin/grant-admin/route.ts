import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const GrantAdminSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
});

/**
 * 관리자 권한 부여 API
 * 현재 ADMIN 권한을 가진 사용자만 다른 사용자에게 ADMIN 권한을 부여할 수 있습니다.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 현재 사용자가 ADMIN인지 확인
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = GrantAdminSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    // 대상 사용자 찾기
    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: '해당 이메일의 사용자를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    if (targetUser.role === 'ADMIN') {
      return NextResponse.json({ error: '이미 관리자 권한을 가지고 있습니다.' }, { status: 400 });
    }

    // 관리자 권한 부여
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    return NextResponse.json({
      success: true,
      message: '관리자 권한이 성공적으로 부여되었습니다.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('관리자 권한 부여 오류:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '관리자 권한 부여 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}

/**
 * 관리자 권한 부여 가능한 사용자 목록 조회
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // 현재 사용자가 ADMIN인지 확인
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    // ADMIN이 아닌 사용자들 조회
    const users = await prisma.user.findMany({
      where: {
        role: { not: 'ADMIN' },
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '사용자 목록 조회 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
