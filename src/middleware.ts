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

  console.log(`[Middleware] Processing: ${pathname}`);

  // 공통 보안 헤더 적용
  const applySecurityHeaders = (res: NextResponse) => {
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    return res;
  };

  // 대시보드는 항상 허용 (임시 해결책)
  if (pathname === '/dashboard') {
    console.log(`[Middleware] Dashboard access - always allowing`);
    return applySecurityHeaders(NextResponse.next());
  }

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isSetupPath = setupPaths.some((path) => pathname.startsWith(path));
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

  if (!isProtectedPath && !isAdminPath && !isSetupPath) {
    console.log(`[Middleware] Non-protected path, allowing: ${pathname}`);
    return applySecurityHeaders(NextResponse.next());
  }

  console.log(`[Middleware] Protected path detected: ${pathname}`);

  // Read JWT from cookies
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET!,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  console.log(`[Middleware] Token check:`, {
    hasToken: !!token,
    tokenEmail: token?.email,
    tokenRole: token?.role,
    tokenSub: token?.sub,
  });

  if (!token) {
    console.log(`[Middleware] No token, redirecting to login`);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // JWT 토큰에서 역할 정보 가져오기
  const userRole = token.role;
  console.log(`[Middleware] User role: ${userRole}`);

  // setup 페이지에 접근하는 경우 역할이 있으면 적절한 페이지로 리다이렉트
  if (isSetupPath && userRole) {
    const redirectUrl = userRole === 'STUDENT' ? '/my/learning' : '/dashboard';
    console.log(`[Middleware] Setup path with role, redirecting to: ${redirectUrl}`);
    return applySecurityHeaders(NextResponse.redirect(new URL(redirectUrl, request.url)));
  }

  // 관리자 경로 접근 제한
  if (isAdminPath && userRole !== 'ADMIN') {
    console.log(`[Middleware] Admin path access denied for role: ${userRole}`);
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.searchParams.set('error', 'forbidden');
    return applySecurityHeaders(NextResponse.redirect(dashboardUrl));
  }

  console.log(`[Middleware] Allowing access to: ${pathname}`);
  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    // protect all but public assets and api route; keep _next and favicon free
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
