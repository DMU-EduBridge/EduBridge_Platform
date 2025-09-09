import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedPaths = ['/dashboard', '/profile', '/projects', '/applications', '/(afterLogin)'];
const adminPaths = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

  if (!isProtectedPath && !isAdminPath) {
    return NextResponse.next();
  }

  // Read JWT from cookies
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminPath && token.role !== 'ADMIN') {
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.searchParams.set('error', 'forbidden');
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // protect all but public assets and api route; keep _next and favicon free
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
