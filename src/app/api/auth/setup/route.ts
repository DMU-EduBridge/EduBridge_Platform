import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const setupSchema = z.object({
  role: z.enum(['STUDENT', 'TEACHER']),
  school: z.string().optional(),
  grade: z.string().optional(),
  subject: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = setupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { role, school, grade, subject } = parsed.data;

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        role,
        school: school || null,
        grade: grade || null,
        subject: subject || null,
      },
    });

    // 역할에 따른 리다이렉트 URL 결정
    const redirectTo = role === 'STUDENT' ? '/problems' : '/dashboard';

    // 응답 헤더에 세션 새로고침을 위한 플래그 추가
    const response = NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
      redirectTo,
    });

    // 세션 새로고침을 위한 헤더 추가
    response.headers.set('X-Session-Refresh', 'true');

    return response;
  } catch (error) {
    console.error('Setup API error:', error);
    return NextResponse.json({ error: '설정 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
