import { authOptions } from '@/lib/core/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ success: true, message: 'Already logged out' });
    }

    // NextAuth 세션 무효화를 위한 응답 생성
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // 모든 NextAuth 관련 쿠키 삭제
    const cookiesToDelete = [
      'next-auth.session-token',
      'next-auth.callback-url',
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token', // HTTPS 환경용
      '__Host-next-auth.csrf-token', // HTTPS 환경용
    ];

    cookiesToDelete.forEach((cookieName) => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    });

    // 추가 인증 관련 쿠키 정리
    response.cookies.set('auth-token', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: false, // 클라이언트에서도 접근 가능
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        error: 'Logout failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
