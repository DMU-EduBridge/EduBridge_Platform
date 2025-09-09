import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const protectedPaths = ['/dashboard', '/profile', '/projects', '/applications', '/(afterLogin)'];
const adminPaths = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

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

  if (!isProtectedPath && !isAdminPath) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Read JWT from cookies
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (isAdminPath && token.role !== 'ADMIN') {
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.searchParams.set('error', 'forbidden');
    return applySecurityHeaders(NextResponse.redirect(dashboardUrl));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    // protect all but public assets and api route; keep _next and favicon free
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
