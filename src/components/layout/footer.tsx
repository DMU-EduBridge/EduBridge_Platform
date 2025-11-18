import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* 로고 및 설명 */}
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <span className="text-sm font-bold text-white">E</span>
              </div>
              <span className="text-xl font-bold">EduBridge</span>
            </div>
            <p className="mb-4 max-w-md text-gray-400">
              AI 기반 교육 플랫폼으로 문제 생성, 학습 분석, 리포트 자동화를 통해 효율적인 교육 환경을 제공합니다.
            </p>
          </div>

          {/* 핵심 링크 */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="mb-4 font-semibold">제품</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/login" className="transition-colors hover:text-white">
                    로그인
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="transition-colors hover:text-white">
                    회원가입
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">정보</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="transition-colors hover:text-white">
                    개인정보처리방침
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="transition-colors hover:text-white">
                    이용약관
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-400">© 2025 EduBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
