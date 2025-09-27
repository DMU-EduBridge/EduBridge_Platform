// 국제화 미들웨어 완전 비활성화
export default function middleware() {
  // 아무것도 하지 않음
}

export const config = {
  matcher: [
    // API와 정적 파일 제외
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
