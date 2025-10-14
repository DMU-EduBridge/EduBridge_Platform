import { prisma } from '@/lib/core/prisma';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

// 보호 경로(로그인 필요). 파일시스템 세그먼트인 /(afterLogin) 은 URL 경로가 아니므로 제외
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/settings',
  '/problems',
  '/reports',
  '/students',
  '/learning-materials',
  '/teacher-reports',
  '/vector-search',
  '/my',
  '/admin',
];
const setupPaths = ['/setup'];
const adminPaths = ['/admin'];
const teacherOnlyPaths = [
  '/students',
  '/learning-materials',
  '/reports',
  '/teacher-reports',
  '/vector-search',
];
const studentOnlyPaths = ['/my'];
const reviewPaths = ['/problems']; // 오답체크 페이지들 (/problems/*/review, /my/learning/*/problems/*/review)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isSetupPath = setupPaths.some((path) => pathname.startsWith(path));
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));
  const isTeacherOnlyPath = teacherOnlyPaths.some((path) => pathname.startsWith(path));
  const isStudentOnlyPath = studentOnlyPaths.some((path) => pathname.startsWith(path));
  const isReviewPath = reviewPaths.some((_path) => pathname.includes('/review'));

  // 공통 보안 헤더 적용
  const applySecurityHeaders = (res: NextResponse) => {
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // 간단 CSP (필요 시 강화)
    res.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "connect-src 'self'",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),
    );
    return res;
  };

  if (!isProtectedPath && !isAdminPath && !isSetupPath) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Read JWT from cookies
  const token = await getToken({
    req: request,
    ...(process.env.NEXTAUTH_SECRET ? { secret: process.env.NEXTAUTH_SECRET } : {}),
  });

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // JWT 토큰에서 역할 정보 가져오기
  const userRole = token.role;

  // 역할이 없는 사용자는 기본적으로 허용 (데모 계정 등)
  // setup 페이지에 접근하는 경우 역할이 있으면 적절한 페이지로 리다이렉트
  if (isSetupPath && userRole) {
    const redirectUrl = userRole === 'STUDENT' ? '/my/learning' : '/dashboard';
    return applySecurityHeaders(NextResponse.redirect(new URL(redirectUrl, request.url)));
  }

  // 역할 기반 접근 제한 (역할이 있는 경우에만 적용)
  if (userRole) {
    if (isAdminPath && userRole !== 'ADMIN') {
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('error', 'forbidden');
      return applySecurityHeaders(NextResponse.redirect(dashboardUrl));
    }

    // 학생 역할은 교사용 경로 접근 제한
    if (isTeacherOnlyPath && userRole === 'STUDENT') {
      const redirectUrl = new URL('/problems', request.url);
      redirectUrl.searchParams.set('error', 'forbidden');
      return applySecurityHeaders(NextResponse.redirect(redirectUrl));
    }

    // 교사/관리자 역할은 학생 전용 경로 접근 제한
    if (isStudentOnlyPath && (userRole === 'TEACHER' || userRole === 'ADMIN')) {
      const redirectUrl = new URL('/dashboard', request.url);
      redirectUrl.searchParams.set('error', 'forbidden');
      return applySecurityHeaders(NextResponse.redirect(redirectUrl));
    }

    // 오답체크 페이지는 학생 전용 (독립적 오답체크와 학습 내 오답체크 모두 포함)
    if (isReviewPath && userRole !== 'STUDENT') {
      const redirectUrl = new URL('/problems', request.url);
      redirectUrl.searchParams.set('error', 'forbidden');
      return applySecurityHeaders(NextResponse.redirect(redirectUrl));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    // protect all but public assets and api route; keep _next and favicon free
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
