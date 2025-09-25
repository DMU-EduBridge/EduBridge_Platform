import createMiddleware from 'next-intl/middleware';
import { locales } from './src/i18n';

export default createMiddleware({
  // 지원하는 로케일 목록
  locales,

  // 기본 로케일
  defaultLocale: 'ko',

  // 로케일 감지 방법
  localeDetection: true,

  // 로케일 접두사 설정
  localePrefix: 'as-needed',
});

export const config = {
  // 국제화를 적용할 경로 패턴
  matcher: [
    // 모든 경로에 적용하되 API, _next/static, _next/image, favicon.ico 제외
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // 루트 경로
    '/',
    // 로케일 접두사가 있는 경로
    '/(ko|en)/:path*',
  ],
};
